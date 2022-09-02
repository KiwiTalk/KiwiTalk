use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Write message to chatroom
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Chat type
    #[serde(rename = "type")]
    pub chat_type: i32,

    /// Message id
    ///
    /// Client send count??
    #[serde(rename = "msgId")]
    pub msg_id: i32,

    /// Message content
    ///
    /// Usually String, but can be json String according to chat type.
    #[serde(rename = "msg")]
    pub message: String,

    /// If true, server will assume the client read last message.
    #[serde(rename = "noSeen")]
    pub no_seen: bool,

    /// Attachment content
    ///
    /// Json data. Have contents and extra data according to chat type.
    /// Also known as `extra`.
    #[serde(rename = "extra")]
    pub attachment: Option<String>,

    /// Used on pluschat.
    ///
    /// Cannot be used to send by normal user
    pub supplement: Option<String>,
}
