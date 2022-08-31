use crate::structs::chat::Chatlog;
use serde::{Deserialize, Serialize};

/// [crate::request::chat::WriteReq] response
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
    #[serde(rename = "chatLog", skip_serializing_if = "Option::is_none")]
    pub chatlog: Option<Chatlog>,
}
