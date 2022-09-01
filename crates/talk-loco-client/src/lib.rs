pub mod client;

use std::{
    pin::Pin,
    task::{Context, Poll},
};

use bson::Document;
use futures::{ready, AsyncRead, AsyncWrite, Future, FutureExt};
use loco_protocol::command::codec::CommandCodec;
use rustc_hash::FxHashMap;
use talk_loco_command::command::{
    codec::{BsonCommandCodec, ReadError, WriteError},
    BsonCommand, ReadBsonCommand,
};
use thiserror::Error;
use tokio::{
    select,
    sync::{mpsc, oneshot},
};

#[derive(Debug)]
pub struct LocoCommandSession {
    sender: mpsc::Sender<HandlerCommand>,
}

impl LocoCommandSession {
    pub fn new<S: AsyncRead + AsyncWrite + Send + Unpin + 'static>(
        stream: S,
    ) -> (Self, LocoBroadcastReceiver) {
        let (sender, receiver) = mpsc::channel(128);
        let (broadcast_sender, broadcast_receiver) = mpsc::channel(128);

        tokio::spawn(CommandSessionHandler::run(
            stream,
            receiver,
            broadcast_sender,
        ));

        (Self { sender }, LocoBroadcastReceiver(broadcast_receiver))
    }

    pub async fn send(&self, command: BsonCommand<Document>) -> CommandRequest {
        let (sender, receiver) = oneshot::channel();

        self.sender
            .send(HandlerCommand::Request(command, sender))
            .await
            .ok();

        CommandRequest(receiver)
    }
}

#[derive(Debug)]
pub struct LocoBroadcastReceiver(mpsc::Receiver<BroadcastResult>);

impl LocoBroadcastReceiver {
    #[inline]
    pub async fn recv(&mut self) -> Option<BroadcastResult> {
        self.0.recv().await
    }

    #[inline]
    pub fn try_recv(&mut self) -> Result<BroadcastResult, mpsc::error::TryRecvError> {
        self.0.try_recv()
    }
}

#[derive(Debug)]
pub struct CommandRequest(oneshot::Receiver<RequestResult>);

impl Future for CommandRequest {
    type Output = RequestResult;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(match ready!(self.0.poll_unpin(cx)) {
            Ok(res) => res,
            Err(_) => Err(RequestError::Read),
        })
    }
}

#[derive(Debug, Error)]
pub enum RequestError {
    #[error("Could not write to stream")]
    Write(#[from] WriteError),

    #[error("Could not read from the stream")]
    Read,
}

pub type RequestResult = Result<BsonCommand<Document>, RequestError>;
pub type BroadcastResult = Result<ReadBsonCommand<Document>, ReadError>;

#[derive(Debug)]
struct CommandSessionHandler<S> {
    read_map: FxHashMap<i32, oneshot::Sender<RequestResult>>,
    next_request_id: i32,
    codec: BsonCommandCodec<S>,
    broadcast_sender: mpsc::Sender<BroadcastResult>,
}

impl<S: AsyncRead + AsyncWrite + Unpin> CommandSessionHandler<S> {
    pub async fn handle_command(&mut self, command: HandlerCommand) {
        match command {
            HandlerCommand::Request(data, response_sender) => {
                self.send_request(data, response_sender).await
            }
        }
    }

    async fn send_request(
        &mut self,
        data: BsonCommand<Document>,
        response_sender: oneshot::Sender<RequestResult>,
    ) {
        match self.codec.write_async(self.next_request_id, &data).await {
            Ok(_) => {
                self.read_map.insert(self.next_request_id, response_sender);
                self.codec.flush_async().await.ok();
                self.next_request_id += 1;
            }

            Err(err) => {
                response_sender.send(Err(err.into())).ok();
            }
        }
    }

    pub async fn handle_read(&mut self, read: ReadBsonCommand<Document>) {
        if let Some(sender) = self.read_map.remove(&read.id) {
            sender.send(Ok(read.command)).ok();
        } else {
            self.broadcast_sender.send(Ok(read)).await.ok();
        }
    }

    pub async fn run(
        stream: S,
        mut receiver: mpsc::Receiver<HandlerCommand>,
        broadcast_sender: mpsc::Sender<BroadcastResult>,
    ) -> S {
        let mut handler = CommandSessionHandler {
            read_map: FxHashMap::default(),
            next_request_id: 0,
            codec: BsonCommandCodec(CommandCodec::new(stream)),
            broadcast_sender,
        };

        loop {
            select! {
                command = receiver.recv() => {
                    if let Some(command) = command {
                        handler.handle_command(command).await;
                    } else {
                        break;
                    }
                }

                read = handler.codec.read_async() => {
                    match read {
                        Ok(read) => handler.handle_read(read).await,

                        Err(err) => {
                            for (_, response_sender) in
                            handler.read_map.drain() {
                                response_sender.send(Err(RequestError::Read)).ok();
                            }

                            handler.broadcast_sender.send(Err(err)).await.ok();
                            break;
                        }
                    }
                }
            };
        }

        handler.codec.0.into_inner()
    }
}

#[derive(Debug)]
enum HandlerCommand {
    Request(BsonCommand<Document>, oneshot::Sender<RequestResult>),
}
