use std::{
    borrow::Cow,
    io::{Cursor, Read, Write},
    string::FromUtf8Error,
};

use futures::{io::Flush, AsyncRead, AsyncWrite, AsyncWriteExt};
use loco_protocol::command::{
    builder::CommandBuilder,
    codec::{CommandCodec, StreamError},
    Command,
};
use serde::{de::DeserializeOwned, Serialize};
use thiserror::Error;

use super::{BsonCommand, ReadBsonCommand};

#[derive(Debug, Error)]
pub enum WriteError {
    #[error(transparent)]
    Codec(#[from] StreamError),

    #[error(transparent)]
    Encode(#[from] bson::ser::Error),
}

#[derive(Debug, Error)]
pub enum ReadError {
    #[error(transparent)]
    Stream(#[from] StreamError),

    /// Response command's status is not 0, means the request is corrupted
    #[error("command corrupted. Command: {:?}", .0.header)]
    Corrupted(Command),

    #[error("invalid header method. {0}")]
    InvalidMethod(#[from] FromUtf8Error),

    #[error(transparent)]
    Decode(#[from] bson::de::Error),
}

/// [BsonCommand] codec
#[derive(Debug)]
pub struct BsonCommandCodec<S>(pub CommandCodec<S>);

impl<S: Write> BsonCommandCodec<S> {
    /// Write [BsonCommand] with given unique request_id
    pub fn write<T: Serialize>(
        &mut self,
        request_id: i32,
        command: &BsonCommand<T>,
    ) -> Result<(), WriteError> {
        let command = encode_bson_command(request_id, command)?;
        self.0.write(&command)?;

        Ok(())
    }

    /// Flush inner stream
    pub fn flush(&mut self) -> std::io::Result<()> {
        self.0.stream_mut().flush()
    }
}

impl<S: Read> BsonCommandCodec<S> {
    /// Read incoming [BsonCommand]
    pub fn read<D: DeserializeOwned>(&mut self) -> Result<ReadBsonCommand<D>, ReadError> {
        let (_, command) = self.0.read()?;

        if command.header.status == 0 {
            let id = command.header.id;
            let method = command.header.method()?;

            let data = bson::de::from_reader(&mut Cursor::new(command.data))?;

            Ok(ReadBsonCommand {
                id,
                command: BsonCommand::new(Cow::Owned(method), command.header.data_type, data),
            })
        } else {
            Err(ReadError::Corrupted(command))
        }
    }
}

impl<S: AsyncWrite + Unpin> BsonCommandCodec<S> {
    /// Write [BsonCommand] with given unique request_id
    pub async fn write_async<T: Serialize>(
        &mut self,
        request_id: i32,
        command: &BsonCommand<T>,
    ) -> Result<(), WriteError> {
        let command = encode_bson_command(request_id, command)?;
        self.0.write_async(&command).await?;

        Ok(())
    }

    /// Flush inner stream async
    pub fn flush_async(&mut self) -> Flush<'_, S> {
        self.0.stream_mut().flush()
    }
}

impl<S: AsyncRead + Unpin> BsonCommandCodec<S> {
    /// Read incoming [BsonCommand]
    pub async fn read_async<D: DeserializeOwned>(
        &mut self,
    ) -> Result<ReadBsonCommand<D>, ReadError> {
        let (_, command) = self.0.read_async().await?;

        if command.header.status == 0 {
            let id = command.header.id;
            let method = command.header.method()?;

            let data = bson::de::from_reader(&mut Cursor::new(command.data))?;

            Ok(ReadBsonCommand {
                id,
                command: BsonCommand::new(Cow::Owned(method), command.header.data_type, data),
            })
        } else {
            Err(ReadError::Corrupted(command))
        }
    }
}

fn encode_bson_command<T: Serialize>(
    request_id: i32,
    command: &BsonCommand<T>,
) -> Result<Command, bson::ser::Error> {
    let builder = CommandBuilder::new(request_id, &command.method);

    Ok(builder.build(0, bson::ser::to_vec(&command.data)?))
}
