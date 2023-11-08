use serde::Serialize;

use crate::channel::{Chatlog, ChannelMeta};

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content", rename_all = "camelCase")]
pub(crate) enum ClientEvent {
    Channel {
        channel: String,
        event: ChannelEvent,
    },

    Kickout {
        reason: i16,
    },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content", rename_all = "camelCase")]
pub(crate) enum ChannelEvent {
    Chat(Chatlog),

    ChatRead { user_id: String, log_id: String },

    ChatDeleted(Chatlog),

    MetaChanged(ChannelMeta),

    Added(Option<Chatlog>),

    Left,
}
