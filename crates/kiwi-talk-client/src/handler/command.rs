use serde::Deserialize;

use crate::chat::Chatlog;

/// Send before server disconnect connection
#[derive(Debug, Clone, Deserialize)]
pub struct Kickout {
    /// Kicked reasoon
    ///
    /// * Change server = 2
    /// * Login another = 0
    /// * Account deleted = 1
    pub reason: i16,
}

/// Message sent from chatroom
#[derive(Debug, Clone, Deserialize)]
pub struct Msg {
    /// Sent chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

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

/// Message read by someone
#[derive(Debug, Clone, Deserialize)]
pub struct DecunRead {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Read user id
    #[serde(rename = "userId")]
    pub user_id: i64,

    /// Read message log id
    ///
    /// Official client decrease every unread chat read count till this chat.
    pub watermark: i64,
}
