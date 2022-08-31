use serde::{Deserialize, Serialize};

/// Delete chat. Official server only deletes message sent before 5 mins max.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteMsgReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Chat log id
    #[serde(rename = "logId")]
    pub log_id: i64,
}
