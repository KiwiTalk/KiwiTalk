use serde::Deserialize;

use crate::structs::openlink::OpenLinkUser;

use super::user::User;

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Response {
    #[serde(rename = "t")]
    pub chat_type: String,

    #[serde(rename = "a")]
    pub watermark_user_ids: Vec<i64>,

    #[serde(rename = "w")]
    pub watermarks: Vec<i64>,

    #[serde(rename = "otk")]
    pub open_token: i32,

    #[serde(rename = "m")]
    pub users: Option<Vec<User>>,

    #[serde(rename = "mi")]
    pub user_ids: Option<Vec<i64>>,

    #[serde(rename = "l")]
    pub last_log_id: i64,

    #[serde(rename = "olu")]
    pub open_link_user: Option<OpenLinkUser>,

    #[serde(rename = "o")]
    pub last_update: i64,
}
