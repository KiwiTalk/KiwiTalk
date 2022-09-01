use serde::{Deserialize, Serialize};

/// Set Chatroom meta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetMetaReq {
    /// Chatroom id
    #[serde(rename = "chatId")]
    pub chat_id: i64,

    /// Meta type. See `structs/chatroom.rs` ChatroomMetaType for predefined types.
    #[serde(rename = "type")]
    pub meta_type: i8,

    /// Json or String content. Different depending on type.
    pub content: String,
}
