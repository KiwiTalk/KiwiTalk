use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Read message in chatroom
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotiReadReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Read message log id
    ///
    /// Official client decrease every unread chat read count till this chat.
    pub watermark: i64,

    /// Openchat link id
    #[serde(rename = "linkId")]
    pub link_id: Option<i64>,
}
