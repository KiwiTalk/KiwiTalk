pub mod client;

use std::{
    collections::HashMap,
    pin::Pin,
    sync::Arc,
    task::{Context, Poll},
};

use bson::Document;
use futures::{
    ready, AsyncRead, AsyncReadExt, AsyncWrite, Future, FutureExt, pin_mut,
};
use loco_protocol::command::codec::CommandCodec;
use nohash_hasher::IntMap;
use parking_lot::Mutex;
use talk_loco_command::{
    command::{
        codec::{BsonCommandCodec, ReadError},
        BsonCommand, ReadBsonCommand,
    },
    response::ResponseData,
};
use tokio::{
    sync::{mpsc, oneshot},
    task::JoinHandle,
};

#[derive(Debug)]
pub struct LocoCommandSession {
    sender: mpsc::Sender<RequestCommand>,

    tasks: (JoinHandle<()>, JoinHandle<()>),
}

impl LocoCommandSession {
    pub fn new<Stream: AsyncRead + AsyncWrite + Send + 'static>(stream: Stream) -> Self {
        Self::new_with_handler(stream, |_| {})
    }

    pub fn new_with_handler<
        Stream: AsyncRead + AsyncWrite + Send + 'static,
        Handler: FnMut(ReadResult) + Send + 'static,
    >(
        stream: Stream,
        handler: Handler,
    ) -> Self {
        let (sender, receiver) = mpsc::channel(32);
        let (read_stream, write_stream) = stream.split();
        let (read_task, write_task) = session_task();

        let read_task = tokio::spawn(read_task.run(read_stream, handler));
        let write_task = tokio::spawn(write_task.run(write_stream, receiver));

        Self {
            sender,
            tasks: (read_task, write_task),
        }
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

impl Drop for LocoCommandSession {
    fn drop(&mut self) {
        let (ref read_task, ref write_task) = self.tasks;

        read_task.abort();
        write_task.abort();
    }
}

#[derive(Debug)]
pub struct CommandRequest(oneshot::Receiver<ResponseData>);

impl Future for CommandRequest {
    type Output = Option<ResponseData>;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(ready!(self.0.poll_unpin(cx)).ok())
    }
}

pub type ReadResult = Result<ReadBsonCommand<Document>, ReadError>;

type ResponseMap = IntMap<i32, oneshot::Sender<ResponseData>>;

struct ReadTask {
    response_map: Arc<Mutex<ResponseMap>>,
}

impl ReadTask {
    #[inline(always)]
    const fn new(response_map: Arc<Mutex<ResponseMap>>) -> Self {
        ReadTask { response_map }
    }

    pub async fn run(self, read_stream: impl AsyncRead, mut handler: impl FnMut(ReadResult)) {
        pin_mut!(read_stream);

        let mut read_codec = BsonCommandCodec(CommandCodec::new(read_stream));

        loop {
            let read = read_codec.read_async().await;

            match read {
                Ok(read) => {
                    if let Some(sender) = self.response_map.lock().remove(&read.id) {
                        sender
                            .send(ResponseData::from_document(read.command.data).unwrap())
                            .ok();
                        continue;
                    }

                    handler(Ok(read));
                }

                Err(_) => {
                    handler(read);
                    break;
                }
            }
        }
    }
}

#[derive(Debug)]
struct WriteTask {
    response_map: Arc<Mutex<ResponseMap>>,
    next_request_id: i32,
}

impl WriteTask {
    #[inline(always)]
    const fn new(response_map: Arc<Mutex<ResponseMap>>) -> Self {
        WriteTask {
            response_map,
            next_request_id: 0,
        }
    }

    pub async fn run(
        mut self,
        write_stream: impl AsyncWrite,
        mut request_recv: mpsc::Receiver<RequestCommand>,
    ) {
        pin_mut!(write_stream);

        let mut write_codec = BsonCommandCodec(CommandCodec::new(write_stream));
        while let Some(request) = request_recv.recv().await {
            let request_id = self.next_request_id;

            self.response_map
                .lock()
                .insert(request_id, request.response_sender);

            if write_codec
                .write_async(request_id, &request.command)
                .await
                .is_err()
                || write_codec.flush_async().await.is_err()
            {
                self.response_map.lock().remove(&request_id);
                break;
            }

            self.next_request_id += 1;
        }
    }
}

fn session_task() -> (ReadTask, WriteTask) {
    let map = Arc::new(Mutex::new(HashMap::default()));

    (ReadTask::new(map.clone()), WriteTask::new(map))
}

#[derive(Debug)]
struct RequestCommand {
    pub command: BsonCommand<Document>,
    pub response_sender: oneshot::Sender<ResponseData>,
}

impl RequestCommand {
    pub const fn new(
        command: BsonCommand<Document>,
        response_sender: oneshot::Sender<ResponseData>,
    ) -> Self {
        Self {
            command,
            response_sender,
        }
    }
}
