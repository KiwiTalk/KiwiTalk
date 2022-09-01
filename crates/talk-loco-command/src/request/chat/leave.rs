use serde::{Deserialize, Serialize};

/// Leave chatroom
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Block chatroom. Cannot rejoin chatroom if true.
    pub block: bool,
}
