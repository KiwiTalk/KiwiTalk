use crate::structs::chat::Chatlog;
use serde::{Deserialize, Serialize};

/// Message sent from chatroom
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Msg {
    /// Sent chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Sent chat log id
    #[serde(rename = "logId")]
    pub log_id: i64,

    #[serde(rename = "chatLog")]
    pub chatlog: Option<Chatlog>,

    /// Sender nickname
    #[serde(rename = "authorNickname", skip_serializing_if = "Option::is_none")]
    pub author_nick: Option<String>,

    /// false If sender sent message without reading.
    ///
    /// If it's false, sent message doesn't decrease read count of last chat.
    #[serde(rename = "noSeen")]
    pub no_seen: bool,

    #[serde(rename = "li", skip_serializing_if = "Option::is_none")]
    pub link_id: Option<i64>,

    /// Act like no_seen.(?)
    /// Only appears on openchat
    #[serde(rename = "notiRead", skip_serializing_if = "Option::is_none")]
    pub noti_read: Option<bool>,
}
