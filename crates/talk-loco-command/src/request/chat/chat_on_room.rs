use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Send before opening chatroom window. Notice server the user opening chatroom window.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatOnRoomReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Last chat log id or 0
    pub token: i64,

    /// Openlink token of chatroom if openchat.
    #[serde(rename = "opt")]
    pub open_token: Option<i32>,
}
