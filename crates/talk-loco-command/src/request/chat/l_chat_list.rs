use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Request every chatroom list
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LChatListReq {
    /// Known chatroom id list
    #[serde(rename = "chatIds")]
    pub chat_ids: Vec<i64>,

    /// Unknown
    #[serde(rename = "maxIds")]
    pub max_ids: Vec<i64>,

    /// Unknown
    #[serde(rename = "lastTokenId")]
    pub last_token_id: i64,

    /// Last chatroom id from list in last response
    #[serde(rename = "lastChatId")]
    pub last_chat_id: Option<i64>,
}
