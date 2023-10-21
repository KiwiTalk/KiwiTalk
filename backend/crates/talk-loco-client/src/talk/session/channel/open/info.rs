use serde::{Deserialize, Serialize};

use crate::talk::{channel::ChannelMeta, chat::Chatlog, openlink::OpenLinkId};

use super::user::DisplayUser;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(untagged)]
pub enum ChannelType {
    DirectChat,
    MultiChat,

    #[serde(rename = "OM")]
    OpenMultiChat,

    #[serde(rename = "OD")]
    OpenDirectChat,

    MemoChat,

    PlusChat,

    Other(String),
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct ChannelInfo {
    #[serde(rename = "type")]
    pub channel_type: ChannelType,

    #[serde(flatten)]
    pub link: Option<OpenLinkId>,

    #[serde(rename = "activeMembersCount")]
    pub active_member_count: i32,

    #[serde(rename = "displayMembers")]
    pub display_members: Vec<DisplayUser>,

    #[serde(rename = "newMessageCount")]
    pub new_chat_count: i32,

    #[serde(rename = "lastLogId")]
    pub last_log_id: i64,

    #[serde(rename = "lastSeenLogId")]
    pub last_seen_log_id: i64,

    #[serde(rename = "lastChatLog")]
    pub last_chat_log: Option<Chatlog>,

    #[serde(rename = "pushAlert")]
    pub push_alert: bool,

    #[serde(rename = "chatMetas")]
    pub channel_metas: Vec<ChannelMeta>,

    #[serde(rename = "directChat")]
    pub direct_chat: Option<bool>,
}
