pub mod normal;
pub mod open;
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

use self::{normal::NormalChannel, open::OpenChannel, user::DisplayUser};

pub type ChannelMetaMap = IntMap<i32, ChannelMeta>;

#[derive(Debug, Clone)]
pub struct ChannelListItem {
    pub channel_type: ChannelType,

    pub last_chat: Option<Chatlog>,

    pub display_users: ArrayVec<DisplayUser, 4>,

    pub unread_count: i32,

    pub active_user_count: i32,

    pub name: String,
    pub profile_image: Option<String>,
}

#[derive(Debug, Clone, Copy)]
pub enum ClientChannel<'a> {
    Normal(NormalChannel<'a>),
    Open(OpenChannel<'a>),
}

impl ClientChannel<'_> {
    pub const fn id(&self) -> i64 {
        match self {
            ClientChannel::Normal(normal) => normal.id(),
            ClientChannel::Open(open) => open.id(),
        }
    }

    pub const fn client(&self) -> &'_ HeadlessTalk {
        match self {
            ClientChannel::Normal(normal) => normal.client(),
            ClientChannel::Open(open) => open.client(),
        }
    }

    pub async fn send_chat(&self, chat: Chat, no_seen: bool) -> ClientResult<Chatlog> {
        let client = self.client();
        let id = self.id();

        let res = TalkSession(&client.session)
            .channel(id)
            .write_chat(&write::Request {
                chat_type: chat.chat_type.0,
                msg_id: chat.message_id,
                message: chat.content.message.as_deref(),
                no_seen,
                attachment: chat.content.attachment.as_deref(),
                supplement: chat.content.supplement.as_deref(),
            })
            .await?;

        let logged = res.chatlog.unwrap_or(Chatlog {
            channel_id: id,

            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),

            author_id: client.user_id,

            send_at: res.send_at,

            chat,

            referer: None,
        });

        client
            .pool
            .spawn({
                let logged = logged.clone();

                move |conn| {
                    diesel::replace_into(schema::chat::table)
                        .values(ChatRow::from_chatlog(logged, None))
                        .execute(conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(logged)
    }

    pub async fn read_chat(&self, watermark: i64) -> ClientResult<()> {
        match self {
            ClientChannel::Normal(normal) => normal.read_chat(watermark).await?,
            ClientChannel::Open(open) => open.read_chat(watermark).await?,
        }

        Ok(())
    }
}
