use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use super::{chat::Chatlog, openlink::OpenLinkId, user::DisplayUserInfo};

/// LOGINLIST chatroom list item.
/// Including essential chatroom info.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelListData {
    /// Chatroom id
    #[serde(rename = "c")]
    pub id: i64,

    /// Chatroom type
    ///
    /// * group = "MultiChat"
    /// * direct = "DirectChat"
    /// * pluschat = "PlusChat"
    /// * self = "MemoChat"
    /// * openchat group = "OM"
    /// * openchat direct = "OD"
    #[serde(rename = "t")]
    pub channel_type: String,

    /// Last chat log id
    #[serde(rename = "ll")]
    pub last_log_id: i64,

    /// Last Chatlog
    #[serde(rename = "l")]
    pub chatlog: Option<Chatlog>,

    /// Member count
    #[serde(rename = "a")]
    pub member_count: i32,

    /// Unread message count
    #[serde(rename = "n")]
    pub unread_count: i32,

    // /// Chatroom metadata(?)
    // #[serde(rename = "m")]
    // pub metadata: ()
    /// Push alert setting
    #[serde(rename = "p")]
    pub push_alert: bool,

    /// Only present if chatroom is Openchat
    #[serde(flatten)]
    pub link: Option<OpenLinkId>,

    /// Chatroom preview icon target user id list
    #[serde(rename = "i")]
    pub icon_user_ids: Option<Vec<i64>>,

    /// Chatroom preview icon target user name list
    #[serde(rename = "k")]
    pub icon_user_nicknames: Option<Vec<String>>,

    /// Unknown. Always 0 on openchat rooms.
    pub mmr: i64,

    /// Unknown
    pub s: i64,

    /// Openlink token.
    #[serde(rename = "o")]
    pub open_token: Option<i32>,

    /// Unknown. Only appears on non openchat rooms.
    pub jn: Option<i32>,
}

#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelInfo {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Chatroom type.
    /// Check ChatroomListData chatroom_type for types.
    #[serde(rename = "type")]
    pub channel_type: String,

    /// Only present if chatroom is openchat
    #[serde(flatten)]
    pub link: Option<OpenLinkId>,

    /// Active member count. May not match the actual user count.
    #[serde(rename = "activeMembersCount")]
    pub active_member_count: i32,

    /// Used for creating chatroom icon
    #[serde(rename = "displayMembers")]
    pub display_members: Vec<DisplayUserInfo>,

    /// Unread message count
    #[serde(rename = "newMessageCount")]
    pub new_chat_count: i32,

    /// true if new_message_count is invalid(?). Does not present on openchat.
    #[serde(
        rename = "invalidNewMessageCount"
    )]
    pub new_chat_count_invalid: Option<bool>,

    // /// Chatroom metadata(?)
    // #[serde(rename = "m")]
    // pub metadata: (),

    // /// Unknown
    // #[serde(rename = "lastUpdatedAt")]
    // pub last_updated_at: Option<i32>,

    // /// Unknown
    // #[serde(rename = "lastMessage")]
    // pub last_message: Option<()>,
    /// Last chat log id
    #[serde(rename = "lastLogId")]
    pub last_log_id: i64,

    /// Last seen(?) chat log id
    #[serde(rename = "lastSeenLogId")]
    pub last_seen_log_id: i64,

    /// Last chat log
    #[serde(rename = "lastChatLog")]
    pub last_chat_log: Option<Chatlog>,

    /// Push alert setting
    #[serde(rename = "pushAlert")]
    pub push_alert: bool,

    /// Chatroom metas
    #[serde(rename = "chatMetas")]
    pub channel_metas: Vec<ChannelMeta>,

    /// true if Openchat direct chat. Only presents on openchat room.
    #[serde(rename = "directChat")]
    pub direct_chat: Option<bool>,

    /// Unknown. Client user join time. (?) Does not present on openchat room.
    #[serde(rename = "joinedAtForNewMem")]
    pub joined_at: Option<i32>,

    /// true if room is invalid(Only client user left, etc.). (?) Does not present on openchat room.
    pub left: Option<bool>,
}

/// Chatroom meta. Like chatroom profile, notice, etc.
///
/// serde does not support integer tag yet. We will switch to enum as fast as the support added.
/// Check serde#745
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelMeta {
    /// Meta type. See [ChannelMetaType] for predefined types.
    #[serde(rename = "type")]
    pub meta_type: i8,

    pub revision: i64,

    /// Meta user id
    #[serde(rename = "authorId")]
    pub author_id: i64,

    /// Updated time in Unix time.
    #[serde(rename = "updatedAt")]
    pub updated_at: i32,

    /// Json or String content depending on type.
    pub content: String,
}

#[repr(i8)]
pub enum ChannelMetaType {
    Notice = 1,
    Group = 2,
    Title = 3,
    Profile = 4,
    Tv = 5,
    Privilege = 6,
    TvLive = 7,
    PlusBackground = 8,
    LiveTalkInfo = 11,
    LiveTalkCount = 12,
    OpenChatChat = 13,
    Bot = 14,
}
