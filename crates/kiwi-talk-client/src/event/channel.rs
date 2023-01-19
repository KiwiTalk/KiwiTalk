use serde::{Deserialize, Serialize};
use talk_loco_command::structs::chat::Chatlog;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum KiwiTalkChannelEvent {
    Chat(ReceivedChat),
    ChatRead(ChatRead),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceivedChat {
    pub channel_id: i64,
    pub link_id: Option<i64>,

    pub log_id: i64,
    pub user_nickname: Option<String>,
    pub chat: Chatlog,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRead {
    /// Channel id
    pub channel_id: i64,

    /// Read user id
    pub user_id: i64,

    /// Read chat log id
    pub log_id: i64,
}
