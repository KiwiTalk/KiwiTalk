use serde::{Deserialize, Serialize};
use talk_loco_command::structs::chat::Chatlog as LocoChatlog;

use crate::channel::{user::UserId, ChannelId};

pub mod builder;

pub type LogId = i64;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Chatlog {
    pub log_id: LogId,
    pub prev_log_id: Option<i64>,

    pub channel_id: ChannelId,

    pub sender_id: UserId,

    pub send_at: i64,

    pub chat: Chat,

    pub referer: Option<i32>,
}

impl From<LocoChatlog> for Chatlog {
    fn from(chatlog: LocoChatlog) -> Self {
        Self {
            log_id: chatlog.log_id,
            prev_log_id: chatlog.prev_log_id,

            channel_id: chatlog.chat_id,

            sender_id: chatlog.author_id,

            send_at: chatlog.send_at,

            referer: chatlog.referer,

            chat: Chat::from(chatlog),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Chat {
    pub chat_type: ChatType,

    pub content: ChatContent,

    pub message_id: i64,
}

impl From<LocoChatlog> for Chat {
    fn from(chatlog: LocoChatlog) -> Self {
        Self {
            chat_type: ChatType(chatlog.chat_type),

            message_id: chatlog.msg_id,

            content: ChatContent::from(chatlog),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Default, Clone, PartialEq, Eq)]
pub struct ChatContent {
    pub message: Option<String>,
    pub attachment: Option<String>,
    pub supplement: Option<String>,
}

impl From<LocoChatlog> for ChatContent {
    fn from(chatlog: LocoChatlog) -> Self {
        Self {
            message: chatlog.message,
            attachment: chatlog.attachment,
            supplement: chatlog.supplement,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct ChatType(pub i32);

macro_rules! define_chat_type {
    ($name: ident, $num: literal) => {
        pub const $name: ChatType = ChatType($num);
    };
}

impl ChatType {
    define_chat_type!(FEED, 0);
    define_chat_type!(TEXT, 1);
    define_chat_type!(PHOTO, 2);
    define_chat_type!(VIDEO, 3);
    define_chat_type!(CONTACT, 4);
    define_chat_type!(AUDIO, 5);
    define_chat_type!(DITEMEMOTICON, 6);
    define_chat_type!(DITEMGIFT, 7);
    define_chat_type!(DITEMIMG, 8);
    define_chat_type!(KAKAOLINKV1, 9);
    define_chat_type!(AVATAR, 11);
    define_chat_type!(STICKER, 12);
    define_chat_type!(SCHEDULE, 13);
    define_chat_type!(VOTE, 14);
    define_chat_type!(LOTTERY, 15);
    define_chat_type!(MAP, 16);
    define_chat_type!(PROFILE, 17);
    define_chat_type!(FILE, 18);
    define_chat_type!(STICKERANI, 20);
    define_chat_type!(NUDGE, 21);
    define_chat_type!(ACTIONCON, 22);
    define_chat_type!(SEARCH, 23);
    define_chat_type!(POST, 24);
    define_chat_type!(STICKERGIF, 25);
    define_chat_type!(REPLY, 26);
    define_chat_type!(MULTIPHOTO, 27);
    define_chat_type!(VOIP, 51);
    define_chat_type!(LIVETALK, 52);
    define_chat_type!(CUSTOM, 71);
    define_chat_type!(ALIM, 72);
    define_chat_type!(PLUSFRIEND, 81);
    define_chat_type!(PLUSEVENT, 82);
    define_chat_type!(PLUSFRIENDVIRAL, 83);
    define_chat_type!(OPEN_SCHEDULE, 96);
    define_chat_type!(OPEN_VOTE, 97);
    define_chat_type!(OPEN_POST, 98);

    pub const DELETED_BIT: i32 = 14;
    pub const DELETED_MASK: i32 = 1 << Self::DELETED_BIT;

    pub fn into_original(self) -> Self {
        Self(self.0 & !Self::DELETED_MASK)
    }

    pub fn into_deleted(self) -> Self {
        Self(self.0 | Self::DELETED_MASK)
    }

    pub fn deleted(self) -> bool {
        (self.0 & Self::DELETED_MASK) != 0
    }
}

impl From<i32> for ChatType {
    fn from(ty: i32) -> Self {
        Self(ty)
    }
}

impl Into<i32> for ChatType {
    fn into(self) -> i32 {
        self.0
    }
}
