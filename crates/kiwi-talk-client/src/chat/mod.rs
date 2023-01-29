use serde::{Deserialize, Serialize};
use talk_loco_command::structs::chat::Chatlog;

use crate::channel::{user::UserId, ChannelId};

pub mod builder;

pub type LogId = i64;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct LoggedChat {
    pub log_id: LogId,
    pub prev_log_id: Option<i64>,

    pub channel_id: ChannelId,

    pub sender_id: UserId,

    pub send_at: i64,

    pub chat: Chat,

    pub referer: Option<i32>,
}

impl From<Chatlog> for LoggedChat {
    fn from(chatlog: Chatlog) -> Self {
        LoggedChat {
            log_id: chatlog.log_id,
            prev_log_id: chatlog.prev_log_id,

            channel_id: chatlog.chat_id,

            sender_id: chatlog.author_id,

            send_at: chatlog.send_at,

            chat: Chat {
                chat_type: chatlog.chat_type,
                content: ChatContent {
                    message: chatlog.message,
                    attachment: chatlog.attachment,
                    supplement: chatlog.supplement,
                },
                message_id: chatlog.msg_id,
            },

            referer: chatlog.referer,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Chat {
    pub chat_type: i32,

    pub content: ChatContent,

    pub message_id: i64,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone, PartialEq, Eq)]
pub struct ChatContent {
    pub message: Option<String>,
    pub attachment: Option<String>,
    pub supplement: Option<String>,
}

#[non_exhaustive]
pub struct ChatType;

impl ChatType {
    pub const FEED: i32 = 0;
    pub const TEXT: i32 = 1;
    pub const PHOTO: i32 = 2;
    pub const VIDEO: i32 = 3;
    pub const CONTACT: i32 = 4;
    pub const AUDIO: i32 = 5;
    pub const DITEMEMOTICON: i32 = 6;
    pub const DITEMGIFT: i32 = 7;
    pub const DITEMIMG: i32 = 8;
    pub const KAKAOLINKV1: i32 = 9;
    pub const AVATAR: i32 = 11;
    pub const STICKER: i32 = 12;
    pub const SCHEDULE: i32 = 13;
    pub const VOTE: i32 = 14;
    pub const LOTTERY: i32 = 15;
    pub const MAP: i32 = 16;
    pub const PROFILE: i32 = 17;
    pub const FILE: i32 = 18;
    pub const STICKERANI: i32 = 20;
    pub const NUDGE: i32 = 21;
    pub const ACTIONCON: i32 = 22;
    pub const SEARCH: i32 = 23;
    pub const POST: i32 = 24;
    pub const STICKERGIF: i32 = 25;
    pub const REPLY: i32 = 26;
    pub const MULTIPHOTO: i32 = 27;
    pub const VOIP: i32 = 51;
    pub const LIVETALK: i32 = 52;
    pub const CUSTOM: i32 = 71;
    pub const ALIM: i32 = 72;
    pub const PLUSFRIEND: i32 = 81;
    pub const PLUSEVENT: i32 = 82;
    pub const PLUSFRIENDVIRAL: i32 = 83;
    pub const OPEN_SCHEDULE: i32 = 96;
    pub const OPEN_VOTE: i32 = 97;
    pub const OPEN_POST: i32 = 98;
}
