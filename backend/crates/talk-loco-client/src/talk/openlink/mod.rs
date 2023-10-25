use bitflags::bitflags;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

// Openlink types
#[repr(i32)]
pub enum OpenLinkType {
    Profile = 1,
    Chatroom = 2,
}

/// Openchat user member types
#[repr(i32)]
pub enum OpenMemberType {
    Owner = 1,
    None = 2,
    Manager = 4,
    Bot = 8,
}

/// Openchat user profile types
#[repr(i32)]
pub enum OpenProfileType {
    Main = 1,
    Anon = 2,
    Anon2 = 4,
    Unknown = 8,
    LinkProfile = 16,
}

bitflags! {
    #[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash)]
    pub struct LinkPrivilegeMask: i16 {
        const URL_SHARABLE = 2;
        const REPORTABLE = 4;
        const PROFILE_EDITABLE = 8;
        const ANY_PROFILE_ALLOWED = 32;
        const USE_PASSCODE = 64;
        const BLINDABLE = 128;
        const NON_SPECIAL_LINK = 512;
        const USE_BOT = 1024;
    }
}

/// Openchat kicked user info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenKickedUserInfo {
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "pi")]
    pub profile_image_url: Option<String>,

    /// Kicked chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Unknown
    pub dc: bool,
}

/// Openlink user. Dont confuse with OpenUser.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OpenLinkUser {
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(rename = "nn")]
    pub nickname: String,

    #[serde(rename = "pi")]
    pub profile_image_url: Option<String>,

    #[serde(rename = "fpi")]
    pub full_profile_image_url: Option<String>,

    #[serde(rename = "opi")]
    pub original_profile_image_url: Option<String>,

    /// See OpenMemberType for types.
    #[serde(rename = "lmt")]
    pub open_member_type: i32,

    /// See OpenProfileType for types.
    #[serde(rename = "ptp")]
    pub profile_type: i32,

    /// Profile link id
    #[serde(rename = "pli")]
    pub profile_link_id: Option<i64>,

    #[serde(rename = "opt")]
    pub open_token: i64,

    /// See LinkPrivilegeMask for more detail.
    #[serde(rename = "pv")]
    pub privilege: LinkPrivilegeMask,
}
