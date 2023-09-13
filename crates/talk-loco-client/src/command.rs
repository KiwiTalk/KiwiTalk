use std::io::{self, ErrorKind};

use futures_lite::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};
use loco_protocol::command::{client::LocoSink as Sink, client::LocoStream as Stream, Command};

#[derive(Debug)]
pub struct LocoSink<T> {
    sink: Sink,
    inner: T,
}

impl<T> LocoSink<T> {
    pub fn new(inner: T) -> Self {
        Self {
            sink: Sink::new(),
            inner,
        }
    }

    pub fn inner(&self) -> &T {
        &self.inner
    }

    pub fn inner_mut(&mut self) -> &mut T {
        &mut self.inner
    }

    pub fn into_inner(self) -> T {
        self.inner
    }
}

impl<T: AsyncWrite + Unpin> LocoSink<T> {
    pub async fn send(&mut self, command: Command<impl AsRef<[u8]>>) -> io::Result<()> {
        self.sink.send(command);

        let slices = self.sink.write_buffer.as_slices();
        self.inner.write_all(slices.0).await?;
        self.inner.write_all(slices.1).await?;

        self.inner.flush().await?;

        Ok(())
    }
}

#[derive(Debug)]
pub struct LocoStream<T> {
    stream: Stream,
    inner: T,
}

impl<T> LocoStream<T> {
    pub fn new(inner: T) -> Self {
        Self {
            stream: Stream::new(),
            inner,
        }
    }

    pub fn inner(&self) -> &T {
        &self.inner
    }

    pub fn inner_mut(&mut self) -> &mut T {
        &mut self.inner
    }

    pub fn into_inner(self) -> T {
        self.inner
    }
}

impl<T: AsyncRead + Unpin> LocoStream<T> {
    pub async fn read(&mut self) -> io::Result<Command<Box<[u8]>>> {
        let mut buffer = [0_u8; 1024];

        loop {
            match self.stream.read() {
                Some(command) => return Ok(command),
                None => {
                    let read = self.inner.read(&mut buffer).await?;
                    if read == 0 {
                        return Err(ErrorKind::UnexpectedEof.into());
                    }

                    self.stream.read_buffer.extend(&buffer[..read]);
                }
            }
        }
    }
}
