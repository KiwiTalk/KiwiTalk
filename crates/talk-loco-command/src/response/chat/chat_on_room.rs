use crate::structs::{openlink::OpenLinkUser, user::UserVariant};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

/// Contains user info, watermark list.
/// Client can update chatroom information before opening chatroom window.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatOnRoomRes {
    /// Chatroom id
    #[serde(rename = "c")]
    pub chat_id: i64,

    /// Chatroom type.
    /// Check `structs/chatroom.rs` ChatroomListData chatroom_type for types.
    #[serde(rename = "t")]
    pub chat_type: String,

    /// watermark user ids
    #[serde(rename = "a")]
    pub watermark_user_ids: Vec<i64>,

    /// Chat read count watermark(chat log id) list.
    /// Decrease every chat read count above watermark.
    #[serde(rename = "w")]
    pub watermarks: Vec<i64>,

    /// Chatroom open token if openchat
    #[serde(rename = "otk")]
    pub open_token: Option<i32>,

    /// User list. Variant different by chatroom type.
    /// The list may not have every user data, especially non active users.
    /// If chatroom is openchat doesn't contain client user.
    /// See open_link_user instead.
    /// If there are too many users it will be null. See user_ids instead.
    ///
    /// TODO: Figure out the max limit.
    #[serde(rename = "m")]
    pub users: Option<Vec<UserVariant>>,

    /// If there are too many users, server will send this instead.
    /// The list may not have every user data, especially non active users.
    #[serde(rename = "mi")]
    pub user_ids: Option<Vec<i64>>,

    /// Latest chat log id
    #[serde(rename = "l")]
    pub last_log_id: i64,

    /// Client open link user if openchat
    #[serde(rename = "olu")]
    pub open_link_user: Option<OpenLinkUser>,

    #[serde(rename = "o")]
    pub unknown_o: i64,

    #[serde(rename = "jsi")]
    pub unknown_jsi: i64,

    /// Unknown (openchat)
    #[serde(rename = "notiRead")]
    pub noti_read: Option<bool>,

    /// Unknown
    #[serde(rename = "f")]
    pub unknown_f: bool,

    /// Unknown JSON
    #[serde(rename = "mr")]
    pub unknown_mr: String,

    // #[serde(rename = "pct")]
    // pub unknown_pct: unknown,

    // #[serde(rename = "sui")]
    // pub unknown_sui: unknown,
    #[serde(rename = "msr")]
    pub unknown_msr: Option<i64>,
}
