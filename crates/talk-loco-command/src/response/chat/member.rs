use crate::structs::user::UserVariant;
use serde::{Deserialize, Serialize};

/// Responses detailed members of chatroom.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemberRes {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// List of requested user list
    #[serde(rename = "members")]
    pub members: Vec<UserVariant>,
}
