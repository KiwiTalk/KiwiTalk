use serde::{Deserialize, Serialize};

/// Sync skipped chats.
/// Official client send this when last log id written is different compared to actual last log id.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncMsgReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Current written last chat log id in client.
    #[serde(rename = "cur")]
    pub current: i64,

    /// Max number to receive once.
    /// The default is 300. But the server always seems to send up to 300 regardless of the number.
    #[serde(rename = "cnt")]
    pub count: i32,

    /// Last chat log id received by server.
    pub max: i64,
}
