use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use crate::talk::{channel::ChannelType, chat::Chatlog, openlink::OpenLinkId};

#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Request<'a> {
    /// Known chatroom id list
    #[serde(rename = "chatIds")]
    pub chat_ids: &'a [i64],

    /// Unknown
    #[serde(rename = "maxIds")]
    pub max_ids: &'a [i64],

    /// Unknown
    #[serde(rename = "lastTokenId")]
    pub last_token_id: i64,

    /// Last chatroom id from list in last response
    #[serde(rename = "lastChatId")]
    pub last_chat_id: Option<i64>,
}

/// Request every chatroom list
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Response {
    /// false if there is more channels to be requested with LCHATLIST
    pub eof: bool,

    /// Latest mcm(?) revision
    #[serde(rename = "mcmRevision")]
    pub mcm_revision: i64,

    /// Latest chatroom id
    #[serde(rename = "lastChatId")]
    pub last_chat_id: Option<i64>,

    /// Latest token(Unknown) id
    #[serde(rename = "lastTokenId")]
    pub last_token_id: Option<i64>,

    /// Latest token(Unknown)(?)
    #[serde(rename = "ltk")]
    pub last_token: Option<i64>,

    /// Latest block token(Unknown)(?)
    #[serde(rename = "lbk")]
    pub last_block_token: i64,

    // Unknown, Unknown item type
    //pub kc: Vec<()>
    /// Deleted chatroom ids(?)
    #[serde(rename = "delChatIds")]
    pub deleted_chat_ids: Vec<i64>,

    #[serde(rename = "chatDatas")]
    pub chat_datas: Vec<ChannelListData>,
}

/// LOGINLIST chatroom list item.
/// Including essential chatroom info.
#[skip_serializing_none]
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct ChannelListData {
    /// Chatroom id
    #[serde(rename = "c")]
    pub id: i64,

    #[serde(flatten)]
    pub channel_type: ChannelListType,

    /// Last chat log id
    #[serde(rename = "ll")]
    pub last_log_id: i64,

    /// Last seen chat log id
    #[serde(rename = "s")]
    pub last_seen_log_id: Option<i64>,

    /// Last Chatlog
    #[serde(rename = "l")]
    pub chatlog: Option<Chatlog>,

    /// Active member count
    #[serde(rename = "a")]
    pub active_member_count: i32,

    /// Unread message count
    #[serde(rename = "n")]
    pub unread_count: i32,

    #[serde(rename = "o")]
    pub last_update: i64,

    // /// Chatroom metadata(?)
    // #[serde(rename = "m")]
    // pub metadata: ()
    /// Push alert setting
    #[serde(rename = "p")]
    pub push_alert: bool,

    /// Chatroom preview icon target user id list
    #[serde(rename = "i")]
    pub icon_user_ids: Option<Vec<i64>>,

    /// Chatroom preview icon target user name list
    #[serde(rename = "k")]
    pub icon_user_nicknames: Option<Vec<String>>,

    /// Unknown. Always 0 on openchat rooms.
    pub mmr: i64,

    /// Unknown. Only appears on non openchat rooms.
    pub jn: Option<i32>,
}

#[derive(Debug, Deserialize, Clone, PartialEq)]
#[serde(tag = "t")]
pub enum ChannelListType {
    DirectChat,
    MultiChat,

    MemoChat,

    #[serde(rename = "OD")]
    OpenDirect(OpenChannelList),

    #[serde(rename = "OM")]
    OpenMulti(OpenChannelList),

    #[serde(other)]
    Other,
}

impl ChannelListType {
    pub fn ty(&self) -> Option<ChannelType> {
        Some(match self {
            ChannelListType::DirectChat => ChannelType::DirectChat,
            ChannelListType::MultiChat => ChannelType::MultiChat,
            ChannelListType::MemoChat => ChannelType::MemoChat,
            ChannelListType::OpenDirect(_) => ChannelType::OpenDirect,
            ChannelListType::OpenMulti(_) => ChannelType::OpenMulti,
            ChannelListType::Other => return None,
        })
    }
}

#[derive(Debug, Deserialize, Clone, PartialEq)]
pub struct OpenChannelList {
    #[serde(flatten)]
    pub link: Option<OpenLinkId>,
}
