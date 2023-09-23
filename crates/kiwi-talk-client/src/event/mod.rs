pub mod channel;

use std::error::Error;

use serde::{Deserialize, Serialize, Serializer};
use talk_loco_client::command::Command;

use crate::handler::error::HandlerError;

use self::channel::ChannelEvent;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum ClientEvent {
    /// Channel event
    Channel(ChannelEvent),

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),

    Unhandled(EventCommand),

    #[serde(serialize_with = "serialize_error_to_string")]
    Error(HandlerError),
}

impl From<HandlerError> for ClientEvent {
    fn from(err: HandlerError) -> Self {
        Self::Error(err)
    }
}

impl From<ChannelEvent> for ClientEvent {
    fn from(channel_event: ChannelEvent) -> Self {
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
    pub data_type: u8,
}

impl<T> From<Command<T>> for EventCommand {
    fn from(command: Command<T>) -> Self {
        Self {
            method: command.header.method.to_string(),
            data_type: command.header.data_type,
        }
    }
}
