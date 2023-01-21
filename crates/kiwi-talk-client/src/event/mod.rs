pub mod channel;

use std::error::Error;

use serde::{Deserialize, Serialize, Serializer};
use talk_loco_command::command::BsonCommand;

use crate::handler::error::KiwiTalkClientHandlerError;

use self::channel::KiwiTalkChannelEvent;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum KiwiTalkClientEvent {
    /// Channel event
    Channel(KiwiTalkChannelEvent),

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),

    Unhandled(EventCommand),

    #[serde(serialize_with = "serialize_error_to_string")]
    Error(KiwiTalkClientHandlerError),
}

impl From<KiwiTalkClientHandlerError> for KiwiTalkClientEvent {
    fn from(err: KiwiTalkClientHandlerError) -> Self {
        Self::Error(err)
    }
}

impl From<KiwiTalkChannelEvent> for KiwiTalkClientEvent {
    fn from(channel_event: KiwiTalkChannelEvent) -> Self {
        Self::Channel(channel_event)
    }
}

fn serialize_error_to_string<E: Error, S>(error: E, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&error.to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventCommand {
    pub method: String,
    pub data_type: i8,
}

impl<T> From<BsonCommand<T>> for EventCommand {
    fn from(command: BsonCommand<T>) -> Self {
        Self {
            method: command.method.to_string(),
            data_type: command.data_type,
        }
    }
}
