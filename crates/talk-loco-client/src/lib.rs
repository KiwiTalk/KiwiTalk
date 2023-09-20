pub mod client;
pub mod command;
pub mod macros;
pub mod secure;
pub mod session;
pub mod structs;
pub mod talk;

use std::{
    io::{self, ErrorKind},
    mem,
    pin::Pin,
    task::{Context, Poll},
};

use futures_lite::{
    future::poll_fn,
    io::{AsyncRead, AsyncWrite},
    ready, Future,
};
use loco_protocol::command::{
    client::{LocoSink, LocoStream, StreamState},
    Command, Header, Method,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;

pub type BoxedCommand = Command<Box<[u8]>>;

pin_project_lite::pin_project!(
    #[derive(Debug)]
    pub struct LocoClient<T> {
        current_id: u32,

        sink: LocoSink,
        stream: LocoStream,

        read_state: ReadState,

        #[pin]
        inner: T,
    }
);

impl<T> LocoClient<T> {
    pub const MAX_READ_SIZE: u64 = 16 * 1024 * 1024;

    pub const fn new(inner: T) -> Self {
        Self {
            current_id: 0,

            sink: LocoSink::new(),
            stream: LocoStream::new(),

            read_state: ReadState::Pending,

            inner,
        }
    }

    pub const fn inner(&self) -> &T {
        &self.inner
    }

    pub fn inner_mut(&mut self) -> &mut T {
        &mut self.inner
    }

    pub fn inner_pin_mut(self: Pin<&mut Self>) -> Pin<&mut T> {
        self.project().inner
    }

    pub fn into_inner(self) -> T {
        self.inner
    }
}

impl<T: AsyncRead> LocoClient<T> {
    pub async fn read(&mut self) -> io::Result<BoxedCommand>
    where
        T: Unpin,
    {
        let mut this = Pin::new(self);

        poll_fn(|cx| this.as_mut().poll_read(cx)).await
    }

    pub fn poll_read(self: Pin<&mut Self>, cx: &mut Context) -> Poll<io::Result<BoxedCommand>> {
        let mut this = self.project();

        let mut buffer = [0_u8; 1024];
        loop {
            match mem::replace(this.read_state, ReadState::Corrupted) {
                ReadState::Pending => match this.stream.read() {
                    Some(command) => {
                        *this.read_state = ReadState::Pending;
                        break Poll::Ready(Ok(command));
                    }

                    None => {
                        if let StreamState::Header(header) = this.stream.state() {
                            if header.data_size as u64 > Self::MAX_READ_SIZE {
                                *this.read_state = ReadState::PacketTooLarge;
                                continue;
                            }
                        }

                        *this.read_state = ReadState::Pending;

                        let read = ready!(this.inner.as_mut().poll_read(cx, &mut buffer))?;
                        if read == 0 {
                            break Poll::Ready(Err(ErrorKind::UnexpectedEof.into()));
                        }

                        this.stream.read_buffer.extend(&buffer[..read]);
                    }
                },

                ReadState::PacketTooLarge => {
                    *this.read_state = ReadState::PacketTooLarge;

                    break Poll::Ready(Err(io::Error::new(
                        ErrorKind::InvalidData,
                        "packet is too large",
                    )));
                }

                ReadState::Corrupted => unreachable!(),
            }
        }
    }
}

impl<T: AsyncWrite> LocoClient<T> {
    pub async fn send(&mut self, method: Method, data: &[u8]) -> io::Result<u32>
    where
        T: Unpin,
    {
        let mut this = Pin::new(self);

        let id = this.as_mut().write(method, data);

        poll_fn(|cx| this.as_mut().poll_flush(cx)).await?;

        Ok(id)
    }

    pub fn write(self: Pin<&mut Self>, method: Method, data: &[u8]) -> u32 {
        let this = self.project();

        let id = {
            *this.current_id += 1;

            *this.current_id
        };

        this.sink.send(Command {
            header: Header {
                id,
                status: 0,
                method,
                data_type: 0,
            },
            data,
        });

        id
    }

    pub fn poll_flush(self: Pin<&mut Self>, cx: &mut Context) -> Poll<io::Result<()>> {
        let mut this = self.project();

        while !this.sink.write_buffer.is_empty() {
            let written = ready!(this.inner.as_mut().poll_write(cx, {
                let slices = this.sink.write_buffer.as_slices();

                if !slices.0.is_empty() {
                    slices.0
                } else {
                    slices.1
                }
            }))?;

            this.sink.write_buffer.drain(..written);
        }

        ready!(this.inner.poll_flush(cx))?;

        Poll::Ready(Ok(()))
    }
}

impl<T: AsyncRead + AsyncWrite + Unpin> LocoClient<T> {
    pub async fn request(
        &mut self,
        method: Method,
        data: &[u8],
    ) -> io::Result<impl Future<Output = io::Result<BoxedCommand>> + '_> {
        let mut this = Pin::new(self);

        let id = this.as_mut().write(method, data);

        poll_fn(|cx| this.as_mut().poll_flush(cx)).await?;

        let read_task = async move {
            Ok(loop {
                let read = poll_fn(|cx| this.as_mut().poll_read(cx)).await?;

                if read.header.id == id {
                    break read;
                }
            })
        };

        Ok(read_task)
    }
}

#[derive(Debug)]
enum ReadState {
    Pending,
    PacketTooLarge,
    Corrupted,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BsonCommandStatus {
    pub status: i32,
}

pub type RequestResult<T> = Result<T, RequestError>;

#[derive(Debug, Error)]
pub enum RequestError {
    #[error("request returned status {0}")]
    Status(i32),

    #[error(transparent)]
    Serialize(#[from] bson::ser::Error),

    #[error(transparent)]
    Read(io::Error),

    #[error(transparent)]
    Write(io::Error),

    #[error(transparent)]
    Deserialize(#[from] bson::de::Error),
}
