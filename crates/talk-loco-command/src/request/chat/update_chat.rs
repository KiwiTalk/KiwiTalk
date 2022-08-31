use serde::{Deserialize, Serialize};

/// Update chatroom push setting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateChatReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    #[serde(rename = "pushAlert")]
    pub push_alert: bool,
}
