use std::{
    io,
    pin::Pin,
    task::{Context, Poll},
};

use futures_lite::{future::poll_fn, ready, AsyncRead, AsyncWrite};
use serde::{Serialize, Deserialize};
use thiserror::Error;

use crate::{BsonCommandStatus, LocoClient, structs::chat::Chatlog};

pin_project_lite::pin_project!(
    #[derive(Debug)]
    pub struct MediaStream<T> {
        pub(super) remaining: i64,

        #[pin]
        pub(super) inner: T,
    }
);

impl<T> MediaStream<T> {
    pub const fn remaining(&self) -> i64 {
        self.remaining
    }

    pub fn into_inner(self) -> T {
        self.inner
    }
}

impl<T: AsyncRead> AsyncRead for MediaStream<T> {
    fn poll_read(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut [u8],
    ) -> Poll<io::Result<usize>> {
        if self.remaining == 0 {
            return Poll::Ready(Ok(0));
        }

        let buf = if buf.len() as i64 > self.remaining {
            &mut buf[..self.remaining as usize]
        } else {
            buf
        };

        let this = self.project();

        let read = ready!(this.inner.poll_read(cx, buf))?;
        *this.remaining -= read as i64;

        Poll::Ready(Ok(read))
    }
}

pin_project_lite::pin_project!(
    #[derive(Debug)]
    pub struct MediaSink<T> {
        pub(super) offset: i64,
        pub(super) remaining: i64,

        #[pin]
        pub(super) inner: LocoClient<T>,
    }
);

impl<T> MediaSink<T> {
    pub const fn offset(&self) -> i64 {
        self.offset
    }

    pub const fn remaining(&self) -> i64 {
        self.remaining
    }

    pub fn into_inner(self) -> LocoClient<T> {
        self.inner
    }
}

impl<T: AsyncRead> MediaSink<T> {
    pub async fn complete(&mut self) -> Result<CompleteRes, CompleteError>
    where
        T: Unpin,
    {
        let mut this = Pin::new(self);

        poll_fn(|cx| this.as_mut().poll_complete(cx)).await
    }

    pub fn poll_complete(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Result<CompleteRes, CompleteError>> {
        let mut this = self.project();

        let res = loop {
            let read = ready!(this.inner.as_mut().poll_read(cx))?;

            if &*read.header.method == "COMPLETE" {
                break read;
            }
        };

        Poll::Ready(
            match bson::from_slice::<BsonCommandStatus>(&res.data)?.status {
                0 => Ok(bson::from_slice(&res.data)?),

                status => Err(CompleteError::Status(status)),
            },
        )
    }
}

impl<T: AsyncWrite> AsyncWrite for MediaSink<T> {
    fn poll_write(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<io::Result<usize>> {
        if self.remaining == 0 {
            return Poll::Ready(Ok(0));
        }

        let buf = if buf.len() as i64 > self.remaining {
            &buf[..self.remaining as usize]
        } else {
            buf
        };

        let this = self.project();

        let written = ready!(this.inner.inner_pin_mut().poll_write(cx, buf))?;
        *this.remaining -= written as i64;

        Poll::Ready(Ok(written))
    }

    fn poll_flush(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        self.project().inner.inner_pin_mut().poll_flush(cx)
    }

    fn poll_close(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        self.project().inner.inner_pin_mut().poll_close(cx)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompleteRes {
    #[serde(rename = "chatLog")]
    chat_log: Option<Chatlog>,
}

#[derive(Debug, Error)]
pub enum CompleteError {
    #[error(transparent)]
    Io(#[from] io::Error),

    #[error(transparent)]
    Bson(#[from] bson::de::Error),

    #[error("media upload failed. status: {0}")]
    Status(i32),
}
