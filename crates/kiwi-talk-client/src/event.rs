use bson::Document;
use serde::{Deserialize, Serialize};
use talk_loco_command::{command::BsonCommand, structs::chat::Chatlog};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
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
    Error(KiwiTalkClientHandlerError),
}

#[derive(Debug, Serialize, Deserialize, Error)]
#[serde(tag = "type", content = "data")]
pub enum KiwiTalkClientHandlerError {
    #[error("Could not decode command")]
    CommandDecode(String),

    #[error("Network error while reading from socket")]
    NetworkRead,

    #[error("Client handler io error")]
    Io,
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
