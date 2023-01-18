use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Chat
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chatlog {
    /// Chatlog id
    #[serde(rename = "logId")]
    pub log_id: i64,

    /// Previous Chatlog id
    #[serde(rename = "prevId")]
    pub prev_log_id: Option<i64>,

    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Chat type
    #[serde(rename = "type")]
    pub chat_type: i32,

    /// Sender id
    #[serde(rename = "authorId")]
    pub author_id: i64,

    /// Message content
    ///
    /// Usually String, but can be json String according to chat type.
    pub message: Option<String>,

    /// Send time in Unix time
    #[serde(rename = "sendAt")]
    pub send_at: i64,

    /// Attachment content
    ///
    /// Json data. Have contents and extra data according to chat type.
    pub attachment: Option<String>,

    /// Used on pluschat.
    ///
    /// * KakaoI = 1
    /// * Bot = 2
    pub referer: Option<i8>,

    /// Used on pluschat.
    ///
    /// Json data like attachment. Having extra pluschat data like quick reply.
    pub supplement: Option<String>,

    /// Unknown id (Client send count??). Don't confuse with log_id.
    #[serde(rename = "msgId")]
    pub msg_id: i64,
}
