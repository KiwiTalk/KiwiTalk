use serde::{Deserialize, Serialize};

use crate::{
    channel::user::UserId,
    chat::{Chatlog, LogId},
};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ChannelEvent {
    Chat {
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
