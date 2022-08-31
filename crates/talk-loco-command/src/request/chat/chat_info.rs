use serde::{Deserialize, Serialize};

/// Request Chatroom info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatInfoReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,
}
