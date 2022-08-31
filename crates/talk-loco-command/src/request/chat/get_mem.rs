use serde::{Deserialize, Serialize};

/// Request simplified member list of chatroom.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetMemReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,
}
