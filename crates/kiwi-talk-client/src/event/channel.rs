use serde::{Deserialize, Serialize};

use crate::{
    channel::{user::UserId, ChannelId},
    chat::{LogId, LoggedChat},
};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ChannelEvent {
    Chat(ReceivedChat),
    ChatRead(ChatRead),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceivedChat {
    pub channel_id: ChannelId,
    pub link_id: Option<i64>,

    pub log_id: LogId,
    pub user_nickname: Option<String>,
    pub chat: LoggedChat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRead {
    /// Channel id
    pub channel_id: ChannelId,

    /// Read user id
    pub user_id: UserId,

    /// Read chat log id
    pub log_id: LogId,
}
