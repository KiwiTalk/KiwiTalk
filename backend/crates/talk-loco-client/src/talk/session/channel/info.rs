use serde::Deserialize;

use crate::talk::{
    channel::{ChannelMeta, ChannelType},
    chat::Chatlog,
    openlink::OpenLinkId,
};

use super::{normal, open};

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct ChannelInfo {
    #[serde(flatten)]
    pub channel_type: ChannelInfoType,

    #[serde(rename = "activeMembersCount")]
    pub active_member_count: i32,

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
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ChannelInfoType {
    DirectChat(NormalChannelInfo),

    MultiChat(NormalChannelInfo),

    MemoChat(NormalChannelInfo),

    #[serde(rename = "OD")]
    OpenDirect(OpenChannelInfo),

    #[serde(rename = "OM")]
    OpenMulti(OpenChannelInfo),

    #[serde(other)]
    Other,
}

impl ChannelInfoType {
    pub fn ty(&self) -> Option<ChannelType> {
        Some(match self {
            ChannelInfoType::DirectChat(_) => ChannelType::DirectChat,
            ChannelInfoType::MultiChat(_) => ChannelType::MultiChat,
            ChannelInfoType::MemoChat(_) => ChannelType::MemoChat,
            ChannelInfoType::OpenDirect(_) => ChannelType::OpenDirect,
            ChannelInfoType::OpenMulti(_) => ChannelType::OpenMulti,
            ChannelInfoType::Other => return None,
        })
    }
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct NormalChannelInfo {
    #[serde(rename = "inviterId")]
    pub inviter_id: Option<i64>,

    #[serde(rename = "displayMembers")]
    pub display_members: Vec<normal::user::DisplayUser>,

    #[serde(rename = "joinedAtForNewMem")]
    pub joined_at_for_new_mem: i64,

    pub left: bool,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct OpenChannelInfo {
    #[serde(rename = "displayMembers")]
    pub display_members: Vec<open::user::DisplayUser>,

    #[serde(flatten)]
    pub link: OpenLinkId,

    #[serde(rename = "directChat")]
    pub direct_chat: Option<bool>,
}
