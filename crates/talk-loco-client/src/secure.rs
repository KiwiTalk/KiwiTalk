use std::{
    io::{self, Cursor, ErrorKind, Read},
    mem,
    pin::Pin,
    task::{Context, Poll},
};

use futures_lite::{ready, AsyncRead, AsyncWrite};
use loco_protocol::secure::{
    client::{LocoClientSecureLayer, ReadState as LayerReadState},
    SecurePacket,
};
use rand::RngCore;

pub use loco_protocol::secure::client::RsaPublicKey;

pin_project_lite::pin_project! {
    #[derive(Debug)]
    pub struct LocoSecureLayer<T> {
        read_state: ReadState,
        write_state: WriteState,

        layer: LocoClientSecureLayer,

        #[pin]
        inner: T,
    }
}

impl<T> LocoSecureLayer<T> {
    pub const MAX_IO_SIZE: u64 = 16 * 1024 * 1024;

    pub fn new(rsa_key: RsaPublicKey, inner: T) -> Self {
        let mut key = [0_u8; 16];
        rand::thread_rng().fill_bytes(&mut key);

        Self {
            read_state: ReadState::Pending,
            write_state: WriteState::Initial(rsa_key),

            layer: LocoClientSecureLayer::new(key),

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

impl<T: AsyncRead> AsyncRead for LocoSecureLayer<T> {
    fn poll_read(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut [u8],
    ) -> Poll<io::Result<usize>> {
        let mut this = self.project();

        loop {
            match mem::replace(this.read_state, ReadState::Corrupted) {
                ReadState::Pending => {
                    if let Some(packet) = this.layer.read() {
                        *this.read_state = ReadState::Reading(Cursor::new(packet.data));
                    } else {
                        if let LayerReadState::Header(header) = this.layer.read_state() {
                            if header.size as u64 - 16 > Self::MAX_IO_SIZE {
                                *this.read_state = ReadState::PacketTooLarge;
                                continue;
                            }
                        }

                        let mut read_buf = [0_u8; 1024];

                        *this.read_state = ReadState::Pending;

                        let read = ready!(this.inner.as_mut().poll_read(cx, &mut read_buf))?;
                        this.layer.read_buffer.extend(&read_buf[..read]);
                    }
                }

                ReadState::Reading(mut cursor) => {
                    let read = cursor.read(buf)?;

                    *this.read_state = if cursor.position() as usize == cursor.get_ref().len() {
                        ReadState::Pending
                    } else {
                        ReadState::Reading(cursor)
                    };

                    break Poll::Ready(Ok(read));
                }

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

impl<T: AsyncWrite> AsyncWrite for LocoSecureLayer<T> {
    fn poll_write(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<io::Result<usize>> {
        let this = self.project();

        loop {
            match mem::replace(this.write_state, WriteState::Corrupted) {
                WriteState::Initial(key) => {
                    this.layer.handshake(&key);

                    *this.write_state = WriteState::Established;
                }

                WriteState::Established => {
                    let write_buf = if buf.len() as u64 > Self::MAX_IO_SIZE {
                        &buf[..Self::MAX_IO_SIZE as usize]
                    } else {
                        buf
                    };

                    let mut iv = [0_u8; 16];
                    rand::thread_rng().fill_bytes(&mut iv);

                    this.layer.send(SecurePacket {
                        iv,
                        data: write_buf.to_vec(),
                    });

                    *this.write_state = WriteState::Established;
                    return Poll::Ready(Ok(write_buf.len()));
                }

                WriteState::Corrupted => unreachable!(),
            }
        }
    }

    fn poll_flush(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        let mut this = self.project();

        while !this.layer.write_buffer.is_empty() {
            match ready!(this.inner.as_mut().poll_write(cx, {
                let slices = this.layer.write_buffer.as_slices();

                if !slices.0.is_empty() {
                    slices.0
                } else {
                    slices.1
                }
            })) {
                res @ (Err(_) | Ok(0)) => {
                    let _ = res?;
                    break;
                }

                Ok(written) => {
                    this.layer.write_buffer.drain(..written);
                }
            }
        }

        ready!(this.inner.poll_flush(cx))?;

        Poll::Ready(Ok(()))
    }

    fn poll_close(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        self.project().inner.poll_close(cx)
    }
}

#[derive(Debug)]
enum ReadState {
    Pending,
    Reading(Cursor<Box<[u8]>>),
    PacketTooLarge,
    Corrupted,
}

#[derive(Debug)]
enum WriteState {
    Initial(RsaPublicKey),
    Established,
    Corrupted,
}
