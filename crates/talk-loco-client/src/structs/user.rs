use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use super::openlink::OpenUser;

/// Minimal user info for chatroom display
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DisplayUserInfo {
    /// User id
    #[serde(rename = "userId")]
    pub user_id: i64,

    /// User nickname
    #[serde(rename = "nickName")]
    pub nickname: String,

    /// Profile image URL. None if profile image is default.
    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: Option<String>,

    /// Country Iso, does not present on openchat.
    #[serde(rename = "countryIso")]
    pub country_iso: Option<String>,
}

/// User
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct User {
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "countryIso")]
    pub country_iso: String,

    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: Option<String>,

    #[serde(rename = "fullProfileImageUrl")]
    pub full_profile_image_url: Option<String>,

    #[serde(rename = "originalProfileImageUrl")]
    pub original_profile_image_url: Option<String>,

    /// See UserType for types.
    #[serde(rename = "type")]
    pub user_type: i32,

    #[serde(rename = "accountId")]
    pub account_id: i64,

    #[serde(rename = "linkedServices")]
    pub linked_services: String,

    #[serde(rename = "statusMessage")]
    pub status_message: String,

    pub suspended: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum UserVariant {
    Normal(User),
    Open(OpenUser),
}

impl UserVariant {
    pub fn id(&self) -> i64 {
        match self {
            UserVariant::Normal(normal) => normal.user_id,
            UserVariant::Open(open) => open.user_id,
        }
    }
}

/// User types. Don't confuse with OpenMemberType.
#[repr(i32)]
pub enum UserType {
    Unknown = -999999,
    NotFriend = -100,
    Deactivated = 9,
    Friend = 100,
    Openchat = 1000,
}
