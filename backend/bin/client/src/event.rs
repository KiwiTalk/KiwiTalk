use serde::Serialize;

use crate::channel::{ChannelMeta, Chatlog};

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content")]
pub(crate) enum ClientEvent {
    Channel {
        id: String,
        event: ChannelEvent,
    },

    SwitchServer,

    Kickout {
        reason: i32,
    },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content")]
pub(crate) enum ChannelEvent {
    Chat(Chatlog),

    #[serde(rename_all = "camelCase")]
    ChatRead { user_id: String, log_id: String },

    ChatDeleted(Chatlog),

    MetaChanged(ChannelMeta),

    Added(Option<Chatlog>),

    Left,
}
