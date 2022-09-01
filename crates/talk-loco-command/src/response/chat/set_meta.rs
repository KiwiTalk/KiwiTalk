use crate::structs::channel_info::ChannelMeta;
use serde::{Deserialize, Serialize};

/// [crate::request::chat::SetMetaReq] response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetMetaRes {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Updated chatroom meta item.
    pub meta: ChannelMeta,
}
