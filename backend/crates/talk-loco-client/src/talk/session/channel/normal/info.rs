use serde::Deserialize;

use crate::structs::{channel::ChannelMeta, chat::Chatlog};

use super::user::DisplayUser;

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct ChannelInfo {
    #[serde(rename = "type")]
    pub channel_type: String,

    #[serde(rename = "activeMembersCount")]
    pub active_member_count: i32,

    #[serde(rename = "displayMembers")]
    pub display_members: Vec<DisplayUser>,

    #[serde(rename = "newMessageCount")]
    pub new_chat_count: i32,

    #[serde(rename = "inviterId")]
    pub inviter_id: Option<i64>,

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

    #[serde(rename = "joinedAtForNewMem")]
    pub joined_at_for_new_mem: i64,

    pub left: bool,
}
