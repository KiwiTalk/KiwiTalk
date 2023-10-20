use serde::Deserialize;

use super::user::User;

/// Contains user info, watermark list.
/// Client can update chatroom information before opening chatroom window.
#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Response {
    #[serde(rename = "t")]
    pub chat_type: String,

    /// watermark user ids
    #[serde(rename = "a")]
    pub watermark_user_ids: Vec<i64>,

    #[serde(rename = "w")]
    pub watermarks: Vec<i64>,

    #[serde(rename = "m")]
    pub users: Option<Vec<User>>,

    #[serde(rename = "mi")]
    pub user_ids: Option<Vec<i64>>,

    #[serde(rename = "l")]
    pub last_log_id: i64,

    #[serde(rename = "o")]
    pub last_update: i64,
}
