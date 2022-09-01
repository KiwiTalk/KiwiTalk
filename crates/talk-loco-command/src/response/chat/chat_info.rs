use crate::structs::channel_info::ChannelInfo;
use serde::{Deserialize, Serialize};

/// [crate::request::chat::ChatInfoReq] response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatInfoRes {
    /// Channel info
    #[serde(rename = "chatInfo")]
    pub chat_info: ChannelInfo,

    /// Unknown. Only appears on openchat rooms.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub o: Option<i32>,
}
