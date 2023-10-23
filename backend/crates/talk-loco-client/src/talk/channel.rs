use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ChannelType {
    DirectChat,
    MultiChat,

    OpenDirect,
    OpenMulti,

    MemoChat,

    PlusChat,

    Other(String),
}

impl ChannelType {
    pub fn as_str(&self) -> &str {
        match self {
            ChannelType::DirectChat => "DirectChat",
            ChannelType::MultiChat => "MultiChat",
            ChannelType::OpenDirect => "OpenDirect",
            ChannelType::OpenMulti => "OpenMulti",
            ChannelType::MemoChat => "MemoChat",
            ChannelType::PlusChat => "PlusChat",
            ChannelType::Other(other) => other,
        }
    }
}

impl From<&str> for ChannelType {
    fn from(value: &str) -> Self {
        match value {
            "DirectChat" => Self::DirectChat,
            "MultiChat" => Self::MultiChat,
            "OpenDirect" => Self::OpenDirect,
            "OpenMulti" => Self::OpenMulti,
            "MemoChat" => Self::MemoChat,
            "PlusChat" => Self::PlusChat,

            other => Self::Other(other.to_owned()),
        }
    }
}

/// Chatroom meta. Like chatroom profile, notice, etc.
///
/// serde does not support integer tag yet. We will switch to enum as fast as the support added.
/// Check serde#745
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ChannelMeta {
    /// Meta type. See [ChannelMetaType] for predefined types.
    #[serde(rename = "type")]
    pub meta_type: i32,

    pub revision: i64,

    /// Meta user id
    #[serde(rename = "authorId")]
    pub author_id: i64,

    /// Updated time in Unix time.
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,

    /// Json or String content depending on type.
    pub content: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(i32)]
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
