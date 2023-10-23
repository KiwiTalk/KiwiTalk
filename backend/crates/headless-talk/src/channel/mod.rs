pub(crate) mod initializer;
pub(crate) mod list;
pub mod user;

use crate::{
    database::{model::chat::ChatRow, schema},
    ClientResult, HeadlessTalk,
};
use arrayvec::ArrayVec;
use diesel::RunQueryDsl;
use nohash_hasher::IntMap;
use talk_loco_client::talk::{
    channel::{ChannelMeta, ChannelType},
    chat::{Chat, Chatlog},
    session::{channel::write, TalkSession},
};

use self::user::DisplayUser;

pub type ChannelMetaMap = IntMap<i32, ChannelMeta>;

#[derive(Debug, Clone)]
pub struct ListChannelItem {
    pub channel_type: ChannelType,

    pub last_chat: Option<Chatlog>,

    pub display_users: ArrayVec<DisplayUser, 4>,

    pub user_count: usize,

    pub metas: ChannelMetaMap,
}

#[derive(Debug, Clone, Copy)]
pub struct NormalChannel<'a> {
    id: i64,
    client: &'a HeadlessTalk,
}

#[derive(Debug, Clone, Copy)]
pub struct OpenChannel<'a> {
    id: i64,
    link_id: i64,
    client: &'a HeadlessTalk,
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

                move |conn| {
                    diesel::replace_into(schema::chat::table)
                        .values(ChatRow::from_chatlog(&logged, None))
                        .execute(conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(logged)
    }
}
