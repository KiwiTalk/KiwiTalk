use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Send before opening chat window. Notice server the user opening chatroom window.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatOnRoomReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Last chat log id or 0
    pub token: i64,
}

/// Send before opening openchat window. Notice server the user opening chatroom window.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatOnRoomOpenReq {
    /// Chatroom id
    #[serde(flatten)]
    pub req: ChatOnRoomReq,

    /// Openlink token of chatroom if openchat.
    #[serde(rename = "opt")]
    pub open_token: i32,
}
