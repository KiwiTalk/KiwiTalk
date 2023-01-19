use std::{error::Error, io};

use bson::Document;
use serde::{Deserialize, Serialize, Serializer};
use talk_loco_command::{
    command::{codec::ReadError, BsonCommand},
    structs::chat::Chatlog,
};
use thiserror::Error;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum KiwiTalkClientEvent {
    Chat {
        channel_id: i64,
        link_id: Option<i64>,

        log_id: i64,
        author_nickname: Option<String>,
        chat: Option<Chatlog>,
    },
    SwitchServer,
    Kickout {
        reason: i16,
    },

    Unhandled(EventCommand),

    #[serde(serialize_with = "serialize_error_to_string")]
    Error(KiwiTalkClientError),
}

impl From<KiwiTalkClientError> for KiwiTalkClientEvent {
    fn from(err: KiwiTalkClientError) -> Self {
        Self::Error(err)
    }
}

fn serialize_error_to_string<E: Error, S>(error: E, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&error.to_string())
}

#[derive(Debug, Error)]
pub enum KiwiTalkClientError {
    #[error("Could not decode command. command: {0}")]
    CommandDecode(String),

    #[error("Network error while reading from socket. {0}")]
    NetworkRead(#[from] ReadError),

    #[error("Client handler io error. {0}")]
    Io(#[from] io::Error),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventCommand {
    pub method: String,
    pub data_type: i8,
    pub data: Document,
}

impl From<BsonCommand<Document>> for EventCommand {
    fn from(command: BsonCommand<Document>) -> Self {
        Self {
            method: command.method.to_string(),
            data_type: command.data_type,
            data: command.data,
        }
    }
}
