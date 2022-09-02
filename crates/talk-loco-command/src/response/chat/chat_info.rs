use crate::structs::channel_info::ChannelInfo;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// [crate::request::chat::ChatInfoReq] response
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatInfoRes {
    /// Channel info
    #[serde(rename = "chatInfo")]
    pub chat_info: ChannelInfo,

    /// Unknown. Only appears on openchat rooms.
    pub o: Option<i32>,
}
