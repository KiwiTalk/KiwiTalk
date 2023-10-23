use serde::Deserialize;

use crate::talk::{openlink::OpenLinkUser, channel::ChannelType};

use super::{normal, open};

/// Contains user info, watermark list.
/// Client can update chatroom information before opening chatroom window.
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct ChatOnChannel {
    #[serde(flatten)]
    pub channel_type: ChatOnChannelType,

    /// watermark user ids
    #[serde(rename = "a")]
    pub watermark_user_ids: Vec<i64>,

    #[serde(rename = "w")]
    pub watermarks: Vec<i64>,

    #[serde(rename = "mi")]
    pub user_ids: Option<Vec<i64>>,

    #[serde(rename = "l")]
    pub last_log_id: i64,

    #[serde(rename = "o")]
    pub last_update: i64,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(tag = "t")]
pub enum ChatOnChannelType {
    DirectChat(NormalChatOnChannel),

    MultiChat(NormalChatOnChannel),

    MemoChat(NormalChatOnChannel),

    #[serde(rename = "OD")]
    OpenDirect(OpenChatOnChannel),

    #[serde(rename = "OM")]
    OpenMulti(OpenChatOnChannel),

    #[serde(other)]
    Other,
}

impl ChatOnChannelType {
    pub fn ty(&self) -> Option<ChannelType> {
        Some(match self {
            ChatOnChannelType::DirectChat(_) => ChannelType::DirectChat,
            ChatOnChannelType::MultiChat(_) => ChannelType::MultiChat,
            ChatOnChannelType::MemoChat(_) => ChannelType::MemoChat,
            ChatOnChannelType::OpenDirect(_) => ChannelType::OpenDirect,
            ChatOnChannelType::OpenMulti(_) => ChannelType::OpenMulti,
            ChatOnChannelType::Other => return None,
        })
    }
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct NormalChatOnChannel {
    #[serde(rename = "m")]
    pub users: Option<Vec<normal::user::User>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct OpenChatOnChannel {
    #[serde(rename = "otk")]
    pub open_token: i32,

    #[serde(rename = "olu")]
    pub open_link_user: Option<OpenLinkUser>,

    #[serde(rename = "m")]
    pub users: Option<Vec<open::user::User>>,
}
