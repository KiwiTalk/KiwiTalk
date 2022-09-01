use serde::{Deserialize, Serialize};

/// Send before opening chatroom window. Notice server the user opening chatroom window.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatOnRoomReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Last chat log id or 0
    pub token: i64,

    /// Openlink token of chatroom if openchat.
    #[serde(rename = "opt", skip_serializing_if = "Option::is_none")]
    pub open_token: Option<i32>,
}
