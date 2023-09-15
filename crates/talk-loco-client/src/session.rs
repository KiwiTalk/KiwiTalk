use std::{
    io, mem,
    pin::Pin,
    task::{Context, Poll},
};

use futures_lite::{ready, AsyncRead, AsyncWrite, Future, Stream};
use loco_protocol::command::{Command, Method};
use nohash_hasher::IntMap;
use tokio::sync::{mpsc, oneshot};

use crate::LocoClient;

#[derive(Debug, Clone)]
pub struct LocoSession {
    sender: mpsc::Sender<Request>,
}

impl LocoSession {
    pub fn new<T: AsyncRead + AsyncWrite>(client: LocoClient<T>) -> (Self, LocoSessionStream<T>) {
        let (sender, receiver) = mpsc::channel(128);

        (Self { sender }, LocoSessionStream::new(receiver, client))
    }

    pub async fn request(&self, method: Method, data: Box<[u8]>) -> Result<CommandRequest, Error> {
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
        response_map: IntMap<u32, oneshot::Sender<Command<Box<[u8]>>>>,

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
    type Item = io::Result<Command<Box<[u8]>>>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let mut this = self.project();

        loop {
            match mem::replace(this.state, SessionState::Done) {
                SessionState::Pending => {
                    if let Poll::Ready(read) = this.client.as_mut().poll_read(cx) {
                        let read = read?;

                        if let Some(sender) = this.response_map.remove(&read.header.id) {
                            let _ = sender.send(read);
                        } else {
                            *this.state = SessionState::Pending;
                            break Poll::Ready(Some(Ok(read)));
                        }
                    }

                    if let Poll::Ready(Some(request)) = this.request_receiver.poll_recv(cx) {
                        let id = this.client.as_mut().write(request.method, &request.data);
                        this.response_map.insert(id, request.response_sender);

                        *this.state = SessionState::Write;
                    } else {
                        *this.state = SessionState::Pending;

                        break Poll::Pending;
                    }
                }

                SessionState::Write => {
                    if this.client.as_mut().poll_flush(cx)?.is_ready() {
                        *this.state = SessionState::Pending;
                    } else {
                        *this.state = SessionState::Write;
                        break Poll::Pending;
                    };
                }

                SessionState::Done => break Poll::Ready(None),
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
    data: Box<[u8]>,
    response_sender: oneshot::Sender<Command<Box<[u8]>>>,
}

pin_project_lite::pin_project! {
    #[derive(Debug)]
    pub struct CommandRequest {
        #[pin]
        inner: oneshot::Receiver<Command<Box<[u8]>>>,
    }
}

impl Future for CommandRequest {
    type Output = Result<Command<Box<[u8]>>, Error>;

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
