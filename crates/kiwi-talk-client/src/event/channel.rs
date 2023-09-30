use serde::{Deserialize, Serialize};

use crate::{
    channel::user::UserId,
    chat::{Chatlog, LogId},
};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum ChannelEvent {
    Chat {
        log_id: LogId,

        link_id: Option<i64>,

        user_nickname: Option<String>,
        chat: Chatlog,
    },

    ChatRead {
        /// Read user id
        user_id: UserId,

        /// Read chat log id
        log_id: LogId,
    },
}
