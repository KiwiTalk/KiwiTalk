use serde::Deserialize;

use crate::structs::{channel::ChannelInfo, channel::ChannelMeta, chat::Chatlog};

/// Send before server disconnect connection
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Kickout {
    /// Kicked reasoon
    ///
    /// * Change server = 2
    /// * Login another = 0
    /// * Account deleted = 1
    pub reason: i16,
}

/// Message sent from chatroom
#[derive(Debug, Clone, Deserialize, PartialEq)]
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

/// Message read by someone
#[derive(Debug, Clone, Deserialize, PartialEq)]
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

/// Sync Chatroom meta update
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct ChgMeta {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Chatroom meta item. Update same type meta.
    pub meta: ChannelMeta,
}

/// Sync Chatroom join
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct SyncJoin {
    /// Chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Last chat
    #[serde(rename = "chatLog")]
    pub chat_log: Option<Chatlog>,
}

/// Sync chat delete
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct SyncDlMsg {
    /// Deleted chat
    #[serde(rename = "chatLog")]
    pub chat_log: Chatlog,
}

/// Sync openlink creation
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct SyncLinkCr {
    /// Openlink id
    #[serde(rename = "ol")]
    pub link_id: i64,

    /// Only presents if the openlink is openchat.
    #[serde(rename = "chatRoom")]
    pub chat_room: Option<ChannelInfo>,
}

/// Sync openchat member type
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct SyncMemT {
    /// Chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Chatroom Openlink id
    #[serde(rename = "li")]
    pub link_id: i64,

    /// User id list
    #[serde(rename = "mids")]
    pub member_ids: Vec<i64>,

    /// User member type list.
    /// Check `src/structs/openlink.rs` OpenMemberType for predefined types.
    #[serde(rename = "mts")]
    pub mem_types: Vec<i8>,
}

/// Sync openchat user profile
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct SyncLinkPf {
    /// Chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Chatroom Openlink id
    #[serde(rename = "li")]
    pub link_id: i64,
}

/// Sync openchat chat hide
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct SyncRewr {
    /// Chatlog
    #[serde(rename = "chatLog")]
    pub chat_log: Chatlog,
}
