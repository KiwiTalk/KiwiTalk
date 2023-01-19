pub mod client;

use std::{
    collections::HashMap,
    pin::Pin,
    task::{Context, Poll},
};

use bson::Document;
use futures::{ready, AsyncRead, AsyncReadExt, AsyncWrite, Future, FutureExt};
use loco_protocol::command::codec::CommandCodec;
use nohash_hasher::BuildNoHashHasher;
use talk_loco_command::{
    command::{
        codec::{BsonCommandCodec, ReadError},
        BsonCommand, ReadBsonCommand,
    },
    response::ResponseData,
};
use tokio::{
    select,
    sync::{mpsc, oneshot},
};

#[derive(Debug)]
pub struct LocoCommandSession {
    sender: mpsc::Sender<RequestCommand>,
}

impl LocoCommandSession {
    pub fn new<
        S: AsyncRead + AsyncWrite + Send + 'static,
        Handler: Send + 'static + FnMut(ReadResult),
    >(
        stream: S,
        handler: Handler,
    ) -> Self {
        let (sender, receiver) = mpsc::channel(128);
        let session_handler = CommandSessionHandler::new(handler);
        tokio::spawn(session_handler.run(stream, receiver));

        Self { sender }
    }

    pub async fn send(&self, command: BsonCommand<Document>) -> CommandRequest {
        let (sender, receiver) = oneshot::channel();

        self.sender
            .send(RequestCommand::new(command, sender))
            .await
            .ok();

        CommandRequest(receiver)
    }
}

#[derive(Debug)]
pub struct CommandRequest(oneshot::Receiver<BsonCommand<ResponseData>>);

impl Future for CommandRequest {
    type Output = Option<BsonCommand<ResponseData>>;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(ready!(self.0.poll_unpin(cx)).ok())
    }
}

pub type ReadResult = Result<ReadBsonCommand<ResponseData>, ReadError>;

#[derive(Debug)]
struct CommandSessionHandler<Handler> {
    read_map: HashMap<i32, oneshot::Sender<BsonCommand<ResponseData>>, BuildNoHashHasher<i32>>,
    next_request_id: i32,
    handler: Handler,
}

impl<Handler: FnMut(ReadResult)> CommandSessionHandler<Handler> {
    pub fn new(handler: Handler) -> Self {
        CommandSessionHandler {
            read_map: HashMap::default(),
            next_request_id: 0,
            handler,
        }
    }

    pub fn add_response(&mut self, sender: oneshot::Sender<BsonCommand<ResponseData>>) -> i32 {
        let request_id = self.next_request_id;

        self.next_request_id += 1;
        self.read_map.insert(request_id, sender);

        request_id
    }

    pub fn take_response(&mut self, id: i32) -> Option<oneshot::Sender<BsonCommand<ResponseData>>> {
        self.read_map.remove(&id)
    }

    pub fn handle_read(&mut self, read: ReadResult) {
        match read {
            Ok(read) => {
                if let Some(sender) = self.read_map.remove(&read.id) {
                    sender.send(read.command).ok();
                } else {
                    (self.handler)(Ok(read));
                }
            }

            Err(_) => {
                (self.handler)(read);
            }
        }
    }

    pub async fn run(
        mut self,
        stream: impl Send + AsyncRead + AsyncWrite + 'static,
        mut request_recv: mpsc::Receiver<RequestCommand>,
    ) {
        let (read_stream, write_stream) = stream.split();

        let (read_sender, mut read_receiver) = mpsc::channel(8);

        let read_handle = tokio::spawn(async move {
            let mut read_codec = BsonCommandCodec(CommandCodec::new(read_stream));

            loop {
                let read = read_codec.read_async().await;
                if read_sender.send(read).await.is_err() {
                    break;
                }
            }
        });

        let mut write_codec = BsonCommandCodec(CommandCodec::new(write_stream));
        loop {
            select! {
                request = request_recv.recv() => {
                    match request {
                        Some(request) => {
                            let request_id = self.add_response(request.response_sender);

                            if write_codec.write_async(request_id, &request.command).await.is_err() {
                                self.take_response(request_id);
                                continue;
                            }

                            if write_codec.flush_async().await.is_err() {
                                self.take_response(request_id);
                                continue;
                            }
                        },

                        None => break,
                    }
                }

                read = read_receiver.recv() => {
                    match read {
                        Some(read) => self.handle_read(read),

                        None => {
                            break;
                        }
                    }
                }
            };
        }

        read_handle.abort();
    }
}

#[derive(Debug)]
struct RequestCommand {
    pub command: BsonCommand<Document>,
    pub response_sender: oneshot::Sender<BsonCommand<ResponseData>>,
}

impl RequestCommand {
    pub const fn new(
        command: BsonCommand<Document>,
        response_sender: oneshot::Sender<BsonCommand<ResponseData>>,
    ) -> Self {
        Self {
            command,
            response_sender,
        }
    }
}
