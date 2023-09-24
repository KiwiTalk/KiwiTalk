use serde::{Deserialize, Serialize};

use crate::{
    channel::user::UserId,
    chat::{Chatlog, LogId},
};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ChannelEvent {
    Chat(ChatReceived),
    ChatRead(ChatRead),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatReceived {
    pub link_id: Option<i64>,

    pub log_id: LogId,
    pub user_nickname: Option<String>,
    pub chat: Chatlog,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRead {
    /// Read user id
    pub user_id: UserId,

    /// Read chat log id
    pub log_id: LogId,
}
