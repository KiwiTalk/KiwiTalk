use crate::structs::channel_info::ChannelMeta;
use serde::{Deserialize, Serialize};

/// Sync Chatroom meta update
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChgMeta {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Chatroom meta item. Update same type meta.
    pub meta: ChannelMeta,
}
