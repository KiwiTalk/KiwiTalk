use crate::structs::chat::Chatlog;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// [crate::request::chat::WriteReq] response
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteRes {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Previous chat log id
    #[serde(rename = "prevId")]
    pub prev_id: i64,

    /// Sent chat log id
    #[serde(rename = "logId")]
    pub log_id: i64,

    /// Send time in Unix time
    #[serde(rename = "sendAt")]
    pub send_at: i64,

    /// Sent chat message id
    #[serde(rename = "msgId")]
    pub msg_id: i32,

    /// Sent message
    #[serde(rename = "chatLog")]
    pub chatlog: Option<Chatlog>,
}
