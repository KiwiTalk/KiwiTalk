use std::{
    io, mem,
    pin::Pin,
    task::{Context, Poll},
};

use futures_lite::{ready, AsyncRead, AsyncWrite, Future, Stream};
use loco_protocol::command::Method;
use nohash_hasher::IntMap;
use tokio::sync::{mpsc, oneshot};

use crate::{BoxedCommand, LocoClient};

#[derive(Debug, Clone)]
pub struct LocoSession {
    sender: mpsc::Sender<Request>,
}

impl LocoSession {
    pub fn new<T>(client: LocoClient<T>) -> (Self, LocoSessionStream<T>) {
        let (sender, receiver) = mpsc::channel(64);

        (Self { sender }, LocoSessionStream::new(receiver, client))
    }

    pub async fn request(&self, method: Method, data: Vec<u8>) -> Result<CommandRequest, Error> {
        let (sender, receiver) = oneshot::channel();

        self.sender
            .send(Request {
                method,
                data,
                response_sender: sender,
            })
            .await
            .map_err(|_| Error::SessionClosed)?;

        Ok(CommandRequest { inner: receiver })
    }
}

pin_project_lite::pin_project!(
    #[derive(Debug)]
    pub struct LocoSessionStream<T> {
        request_receiver: mpsc::Receiver<Request>,
        response_map: IntMap<u32, oneshot::Sender<BoxedCommand>>,

        state: SessionState,

        #[pin]
        client: LocoClient<T>,
    }
);

impl<T> LocoSessionStream<T> {
    fn new(request_receiver: mpsc::Receiver<Request>, client: LocoClient<T>) -> Self {
        Self {
            request_receiver,
            response_map: IntMap::default(),

            state: SessionState::Pending,

            client,
        }
    }
}

impl<T: AsyncRead + AsyncWrite> Stream for LocoSessionStream<T> {
    type Item = io::Result<BoxedCommand>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let mut this = self.project();

        loop {
            match mem::replace(this.state, SessionState::Done) {
                SessionState::Pending => {
                    while let Poll::Ready(read) = this.client.as_mut().poll_read(cx) {
                        let read = read?;

                        if let Some(sender) = this.response_map.remove(&read.header.id) {
                            let _ = sender.send(read);
                        } else {
                            *this.state = SessionState::Pending;
                            return Poll::Ready(Some(Ok(read)));
                        }
                    }

                    let mut receiver_read = false;
                    while let Poll::Ready(Some(request)) = this.request_receiver.poll_recv(cx) {
                        let id = this.client.as_mut().write(request.method, &request.data);
                        this.response_map.insert(id, request.response_sender);

                        if !receiver_read {
                            receiver_read = true;
                        }
                    }

                    if receiver_read {
                        *this.state = SessionState::Write;
                    } else {
                        *this.state = SessionState::Pending;
                        return Poll::Pending;
                    }
                }

                SessionState::Write => {
                    if this.client.as_mut().poll_flush(cx)?.is_ready() {
                        *this.state = SessionState::Pending;
                    } else {
                        *this.state = SessionState::Write;
                        return Poll::Pending;
                    };
                }

                SessionState::Done => return Poll::Ready(None),
            }
        }
    }
}

#[derive(Debug, Clone, Copy)]
enum SessionState {
    Pending,
    Write,
    Done,
}

#[derive(Debug)]
struct Request {
    method: Method,
    data: Vec<u8>,
    response_sender: oneshot::Sender<BoxedCommand>,
}

pin_project_lite::pin_project! {
    #[derive(Debug)]
    pub struct CommandRequest {
        #[pin]
        inner: oneshot::Receiver<BoxedCommand>,
    }
}

impl Future for CommandRequest {
    type Output = Result<BoxedCommand, Error>;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        let command = ready!(self
            .project()
            .inner
            .poll(cx)
            .map_err(|_| Error::SessionClosed))?;

        Poll::Ready(Ok(command))
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("session closed")]
    SessionClosed,
}
