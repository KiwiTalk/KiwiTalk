use serde::{Deserialize, Serialize};

/// Request detailed members of chatroom.
/// Official client send this when clicking profile on chatroom.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemberReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// List of requesting user id list
    #[serde(rename = "memberIds")]
    pub user_ids: Vec<i64>,
}
