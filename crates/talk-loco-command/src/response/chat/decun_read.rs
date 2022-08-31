use serde::{Deserialize, Serialize};

/// Message read by someone
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecunRead {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Read user id
    #[serde(rename = "userId")]
    pub user_id: i64,

    /// Read message log id
    ///
    /// Official client decrease every unread chat read count till this chat.
    pub watermark: i64,
}
