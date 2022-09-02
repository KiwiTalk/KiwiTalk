use crate::structs::{channel_info::ChannelInfo, chat::Chatlog};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Sync Chatroom join
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncJoin {
    /// Chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Last chat
    #[serde(rename = "chatLog")]
    pub chat_log: Option<Chatlog>,
}

/// Sync chat delete
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncDlMsg {
    /// Deleted chat
    #[serde(rename = "chatLog")]
    pub chat_log: Chatlog,
}

/// Sync openlink creation
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncLinkCr {
    /// Openlink id
    #[serde(rename = "ol")]
    pub link_id: i64,

    /// Only presents if the openlink is openchat.
    #[serde(rename = "chatRoom")]
    pub chat_room: Option<ChannelInfo>,
}

/// Sync openchat member type
#[derive(Debug, Clone, Serialize, Deserialize)]
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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncLinkPf {
    /// Chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Chatroom Openlink id
    #[serde(rename = "li")]
    pub link_id: i64,
}

/// Sync openchat chat hide
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncRewr {
    /// Chatlog
    #[serde(rename = "chatLog")]
    pub chat_log: Chatlog,
}
