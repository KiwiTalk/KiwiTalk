use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DisplayUser {
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: Option<String>,

    #[serde(rename = "countryIso")]
    pub country_iso: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct User {
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "countryIso")]
    pub country_iso: String,

    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: String,

    #[serde(rename = "fullProfileImageUrl")]
    pub full_profile_image_url: String,

    #[serde(rename = "originalProfileImageUrl")]
    pub original_profile_image_url: String,

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
