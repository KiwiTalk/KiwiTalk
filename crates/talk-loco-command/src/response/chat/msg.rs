use crate::structs::chat::Chatlog;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Message sent from chatroom
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Msg {
    /// Sent chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Sent chat log id
    #[serde(rename = "logId")]
    pub log_id: i64,

    #[serde(rename = "chatLog")]
    pub chatlog: Chatlog,

    /// Sender nickname
    #[serde(rename = "authorNickname")]
    pub author_nickname: Option<String>,

    /// false If sender sent message without reading.
    ///
    /// If it's false, sent message doesn't decrease read count of last chat.
    #[serde(rename = "noSeen")]
    pub no_seen: bool,

    #[serde(rename = "li")]
    pub link_id: Option<i64>,

    /// Act like no_seen.(?)
    /// Only appears on openchat
    #[serde(rename = "notiRead")]
    pub noti_read: Option<bool>,
}
