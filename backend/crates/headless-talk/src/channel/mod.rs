pub mod user;

use crate::{
    database::{model::chat::ChatRow, schema},
    ClientResult, HeadlessTalk,
};
use arrayvec::ArrayVec;
use diesel::RunQueryDsl;
use nohash_hasher::IntMap;
use serde::{Deserialize, Serialize};
use talk_loco_client::talk::{
    channel::{ChannelMeta as LocoChannelMeta, ChannelType},
    chat::{Chat, Chatlog},
    session::{channel::write, TalkSession},
};

use self::user::DisplayUser;

pub type ChannelMetaMap = IntMap<i32, ChannelMeta>;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChannelKind {
    Normal,
    Open,
    Unknown,
}

#[extend::ext]
pub impl ChannelType {
    fn kind(&self) -> ChannelKind {
        match self {
            ChannelType::DirectChat | ChannelType::MemoChat | ChannelType::MultiChat => {
                ChannelKind::Normal
            }

            ChannelType::OpenDirectChat | ChannelType::OpenMultiChat => ChannelKind::Open,

            _ => ChannelKind::Unknown,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ListChannelItem {
    pub channel_type: ChannelType,

    pub last_chat: Option<Chatlog>,

    pub display_users: ArrayVec<DisplayUser, 4>,

    pub user_count: usize,

    pub metas: ChannelMetaMap,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ChannelMeta {
    pub author_id: i64,

    pub updated_at: i64,
    pub revision: i64,

    pub content: String,
}

impl From<LocoChannelMeta> for ChannelMeta {
    fn from(meta: LocoChannelMeta) -> Self {
        Self {
            author_id: meta.author_id,
            updated_at: meta.updated_at,
            revision: meta.revision,
            content: meta.content,
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ClientChannel<'a> {
    id: i64,
    client: &'a HeadlessTalk,
}

impl<'a> ClientChannel<'a> {
    #[inline(always)]
    pub const fn new(id: i64, client: &'a HeadlessTalk) -> Self {
        Self { id, client }
    }

    #[inline(always)]
    pub const fn channel_id(&self) -> i64 {
        self.id
    }
}

impl ClientChannel<'_> {
    pub async fn send_chat(&self, chat: Chat, no_seen: bool) -> ClientResult<Chatlog> {
        let res = TalkSession(&self.client.session)
            .channel(self.id)
            .write_chat(&write::Request {
                chat_type: chat.chat_type.0,
                msg_id: chat.message_id,
                message: chat.content.message.as_deref(),
                no_seen,
                attachment: chat.content.attachment.as_deref(),
                supplement: chat.content.supplement.as_deref(),
            })
            .await?;

        let logged = res.chatlog.unwrap_or_else(|| Chatlog {
            channel_id: self.id,

            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),

            author_id: self.client.user_id,

            send_at: res.send_at,

            chat,

            referer: None,
        });

        self.client
            .pool
            .spawn({
                let logged = logged.clone();

                move |mut conn| {
                    diesel::replace_into(schema::chat::table)
                        .values(ChatRow::from_chatlog(&logged, None))
                        .execute(&mut conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(logged)
    }
}
