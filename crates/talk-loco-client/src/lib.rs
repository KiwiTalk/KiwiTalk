pub mod client;
pub mod command;
pub mod macros;
pub mod secure;
pub mod session;

use std::io;

use command::{LocoSink, LocoStream};
use futures_lite::io::{AsyncRead, AsyncWrite};
use futures_util::{
    io::{ReadHalf, WriteHalf},
    AsyncReadExt,
};
use loco_protocol::command::{Command, Header, Method};
use serde::{Serialize, Deserialize};
use thiserror::Error;

#[derive(Debug)]
pub struct LocoClient<T> {
    current_id: u32,
    stream: LocoStream<ReadHalf<T>>,
    sink: LocoSink<WriteHalf<T>>,
}

impl<T: AsyncRead + AsyncWrite + Unpin> LocoClient<T> {
    pub fn new(inner: T) -> Self {
        let (read, write) = inner.split();

        Self {
            current_id: 0,
            stream: LocoStream::new(read),
            sink: LocoSink::new(write),
        }
    }

    pub async fn send(&mut self, method: Method, data: Box<[u8]>) -> io::Result<u32> {
        let id = {
            self.current_id += 1;

            self.current_id
        };

        self.sink
            .send(Command {
                header: Header {
                    id,
                    status: 0,
                    method,
                    data_type: 0,
                },
                data,
            })
            .await?;

        Ok(id)
    }

    pub async fn read(&mut self) -> io::Result<Command<Box<[u8]>>> {
        Ok(self.stream.read().await?)
    }

    pub async fn read_id(&mut self, id: u32) -> io::Result<Command<Box<[u8]>>> {
        Ok(loop {
            let command = self.read().await?;

            if command.header.id == id {
                break command;
            }
        })
    }

    pub const fn reader(&self) -> &ReadHalf<T> {
        self.stream.inner()
    }

    pub fn read_mut(&mut self) -> &mut ReadHalf<T> {
        self.stream.inner_mut()
    }

    pub const fn writer(&self) -> &WriteHalf<T> {
        self.sink.inner()
    }

    pub fn writer_mut(&mut self) -> &mut WriteHalf<T> {
        self.sink.inner_mut()
    }

    pub fn into_inner(self) -> T {
        self.sink
            .into_inner()
            .reunite(self.stream.into_inner())
            .unwrap()
    }
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
