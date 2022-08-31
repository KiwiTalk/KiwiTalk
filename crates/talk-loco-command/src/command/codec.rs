use std::{
    borrow::Cow,
    error::Error,
    fmt::Display,
    io::{Cursor, Read, Write},
    string::FromUtf8Error,
};

use bson::Document;
use futures::{io::Flush, AsyncRead, AsyncWrite, AsyncWriteExt};
use loco_protocol::command::{
    builder::CommandBuilder,
    codec::{CommandCodec, StreamError},
    Command,
};

use super::{BsonCommand, ReadBsonCommand};

#[derive(Debug)]
pub enum WriteError {
    Codec(StreamError),
    Encode(bson::ser::Error),
}

impl From<StreamError> for WriteError {
    fn from(err: StreamError) -> Self {
        Self::Codec(err)
    }
}

impl From<bson::ser::Error> for WriteError {
    fn from(err: bson::ser::Error) -> Self {
        Self::Encode(err)
    }
}

impl Display for WriteError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            WriteError::Codec(err) => err.fmt(f),
            WriteError::Encode(err) => err.fmt(f),
        }
    }
}

impl Error for WriteError {}

#[derive(Debug)]
pub enum ReadError {
    Stream(StreamError),

    /// Response command's status is not 0, means the request is corrupted
    Corrupted(Command),

    InvalidMethod(FromUtf8Error),
    Decode(bson::de::Error),
}

impl From<StreamError> for ReadError {
    fn from(err: StreamError) -> Self {
        Self::Stream(err)
    }
}

impl From<FromUtf8Error> for ReadError {
    fn from(err: FromUtf8Error) -> Self {
        Self::InvalidMethod(err)
    }
}

impl From<bson::de::Error> for ReadError {
    fn from(err: bson::de::Error) -> Self {
        Self::Decode(err)
    }
}

impl Display for ReadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ReadError::Stream(err) => err.fmt(f),
            ReadError::Corrupted(err) => {
                write!(f, "Read stream corrupted. status: {}", err.header.status)
            }
            ReadError::InvalidMethod(err) => err.fmt(f),
            ReadError::Decode(err) => err.fmt(f),
        }
    }
}

impl Error for ReadError {}

/// [BsonCommand] codec
#[derive(Debug)]
pub struct BsonCommandCodec<S>(pub CommandCodec<S>);

impl<S: Write> BsonCommandCodec<S> {
    /// Write [BsonCommand] with given unique request_id
    pub fn write(
        &mut self,
        request_id: i32,
        command: &BsonCommand<Document>,
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
    pub fn read(&mut self) -> Result<ReadBsonCommand<Document>, ReadError> {
        let (_, command) = self.0.read()?;

        if command.header.status == 0 {
            let id = command.header.id;
            let method = command.header.method()?;

            let data = bson::Document::from_reader(&mut Cursor::new(command.data))?;

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
    pub async fn write_async(
        &mut self,
        request_id: i32,
        command: &BsonCommand<Document>,
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
    pub async fn read_async(&mut self) -> Result<ReadBsonCommand<Document>, ReadError> {
        let (_, command) = self.0.read_async().await?;

        if command.header.status == 0 {
            let id = command.header.id;
            let method = command.header.method()?;

            let data = bson::Document::from_reader(&mut Cursor::new(command.data))?;

            Ok(ReadBsonCommand {
                id,
                command: BsonCommand::new(Cow::Owned(method), command.header.data_type, data),
            })
        } else {
            Err(ReadError::Corrupted(command))
        }
    }
}

fn encode_bson_command(
    request_id: i32,
    command: &BsonCommand<Document>,
) -> Result<Command, bson::ser::Error> {
    let builder = CommandBuilder::new(request_id, &command.method);

    Ok(builder.build(0, bson::ser::to_vec(&command.data)?))
}
