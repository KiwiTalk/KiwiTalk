pub mod client;
pub mod command;
pub mod secure;
pub mod macros;

use std::{
    collections::HashMap,
    io,
    pin::{pin, Pin},
    sync::Arc,
    task::{Context, Poll},
};

use command::LocoSink;
use futures_lite::{ready, AsyncRead, AsyncWrite, Future, Stream, StreamExt};
use futures_util::AsyncReadExt;
use loco_protocol::command::{Command, Header, Method};
use nohash_hasher::IntMap;
use parking_lot::Mutex;
use serde::Serialize;
use thiserror::Error;
use tokio::{
    select,
    sync::{mpsc, oneshot},
};

use crate::command::LocoStream;

pub type ReadResult = Result<Command<Box<[u8]>>, io::Error>;

#[derive(Debug)]
pub struct LocoRequestSession {
    sender: mpsc::Sender<Request>,
}

impl LocoRequestSession {
    pub fn new(
        stream: impl AsyncRead + AsyncWrite + Unpin,
    ) -> (Self, impl Stream<Item = ReadResult>) {
        let (read, write) = stream.split();

        let (sender, receiver) = mpsc::channel(128);

        let (read_stream, write_task) = {
            let map = Arc::new(Mutex::new(HashMap::default()));

            (
                read_stream(read, map.clone()),
                write_task(write, map, receiver),
            )
        };

        let stream = async_stream::stream!({
            let mut read_stream = pin!(read_stream);
            let mut write_task = pin!(write_task);

            loop {
                select! {
                    _ = write_task.as_mut() => {},
                    Some(next) = read_stream.next() => {
                        yield next;
                    }

                    else => {
                        break;
                    }
                }
            }
        });

        (Self { sender }, stream)
    }

    pub async fn request(
        &self,
        method: Method,
        data: &impl Serialize,
    ) -> Result<CommandRequest, SendError> {
        let data = bson::to_vec(data)?.into_boxed_slice();

        let (sender, receiver) = oneshot::channel();

        self.sender
            .send(Request {
                method,
                data_type: 0,
                data,
                response_sender: sender,
            })
            .await
            .map_err(|_| SendError::SessionClosed)?;

        Ok(CommandRequest { inner: receiver })
    }
}

type ResponseMap = IntMap<u32, oneshot::Sender<Command<Box<[u8]>>>>;

fn read_stream(
    read: impl AsyncRead + Unpin,
    response_map: Arc<Mutex<ResponseMap>>,
) -> impl Stream<Item = ReadResult> {
    async_stream::stream!({
        let mut stream = LocoStream::new(read);

        loop {
            match stream.read().await {
                Ok(read) => {
                    let sender = response_map.lock().remove(&read.header.id);

                    if let Some(sender) = sender {
                        let _ = sender.send(read);
                    } else {
                        yield Ok(read);
                    }
                }

                Err(err) => {
                    yield Err(err);
                }
            }
        }
    })
}

async fn write_task(
    write: impl AsyncWrite + Unpin,
    response_map: Arc<Mutex<ResponseMap>>,
    mut recv: mpsc::Receiver<Request>,
) -> Result<(), io::Error> {
    let mut sink = LocoSink::new(write);
    let mut current_id = 0;

    while let Some(req) = recv.recv().await {
        let id = {
            current_id += 1;
            current_id
        };

        sink.send(Command {
            header: Header {
                id,
                status: 0,
                method: req.method,
                data_type: req.data_type,
            },
            data: req.data,
        })
        .await?;

        response_map.lock().insert(id, req.response_sender);
    }

    Ok(())
}

#[derive(Debug)]
struct Request {
    method: Method,
    data_type: u8,
    data: Box<[u8]>,
    response_sender: oneshot::Sender<Command<Box<[u8]>>>,
}

#[derive(Debug, Error)]
pub enum SendError {
    #[error(transparent)]
    Serialize(#[from] bson::ser::Error),

    #[error("Session closed")]
    SessionClosed,
}

pin_project_lite::pin_project! {
    #[derive(Debug)]
    pub struct CommandRequest {
        #[pin]
        inner: oneshot::Receiver<Command<Box<[u8]>>>,
    }
}

impl Future for CommandRequest {
    type Output = Result<Command<Box<[u8]>>, ResponseError>;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        let command = ready!(self
            .project()
            .inner
            .poll(cx)
            .map_err(|_| ResponseError::SessionClosed))?;

        Poll::Ready(Ok(command))
    }
}

#[derive(Debug, Error)]
pub enum ResponseError {
    #[error(transparent)]
    Deserialize(#[from] bson::de::Error),

    #[error("Session closed")]
    SessionClosed,
}
