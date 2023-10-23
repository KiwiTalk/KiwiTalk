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
    pub profile_image_url: String,
}

#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct User {
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "pi")]
    pub profile_image_url: String,

    #[serde(rename = "fpi")]
    pub full_profile_image_url: String,

    #[serde(rename = "opi")]
    pub original_profile_image_url: String,

    #[serde(rename = "type")]
    pub user_type: i32,

    #[serde(rename = "mt")]
    pub open_member_type: i32,

    #[serde(rename = "opt")]
    pub open_token: i32,

    #[serde(rename = "pli")]
    pub profile_link_id: Option<i64>,
}
