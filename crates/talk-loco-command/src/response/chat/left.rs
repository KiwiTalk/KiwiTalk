use serde::{Deserialize, Serialize};

/// Sync client left chatroom
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Left {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Last token(?) id
    #[serde(rename = "lastTokenId")]
    pub last_token_id: i64,
}
