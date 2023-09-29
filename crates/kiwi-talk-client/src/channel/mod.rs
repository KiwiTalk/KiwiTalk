/*
pub mod normal;
pub mod open;
*/
pub mod user;

use crate::{
    chat::{Chat, Chatlog, LogId},
    database::chat::{ChatDatabaseExt, ChatRow},
    ClientResult, KiwiTalkSession,
};
use futures::{pin_mut, StreamExt};
use nohash_hasher::IntMap;
use serde::{Deserialize, Serialize};
use talk_loco_client::{
    structs::channel::ChannelMeta as LocoChannelMeta,
    talk::session::{SyncChatReq, TalkSession, WriteChatReq},
};
use tokio::sync::mpsc::channel;

pub type ChannelId = i64;

pub type ChannelMetaMap = IntMap<i32, ChannelMeta>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChannelListData {
    pub channel_type: String,

    pub last_chat: Option<Chatlog>,
    pub last_log_id: LogId,
    pub last_seen_log_id: LogId,
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

/*
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum ChannelDataVariant {
    Normal(NormalChannelData),
    Open(()),
}

impl From<NormalChannelData> for ChannelDataVariant {
    fn from(data: NormalChannelData) -> Self {
        Self::Normal(data)
    }
}

// TODO
impl From<()> for ChannelDataVariant {
    fn from(data: ()) -> Self {
        Self::Open(data)
    }
}
*/

#[derive(Debug, Clone, Copy)]
pub struct ClientChannel<'a> {
    id: ChannelId,

    client: &'a KiwiTalkSession,
}

impl<'a> ClientChannel<'a> {
    #[inline(always)]
    pub const fn new(id: ChannelId, client: &'a KiwiTalkSession) -> Self {
        Self { id, client }
    }

    #[inline(always)]
    pub const fn channel_id(&self) -> ChannelId {
        self.id
    }
}

impl ClientChannel<'_> {
    pub async fn send_chat(&self, chat: Chat, no_seen: bool) -> ClientResult<Chatlog> {
        let res = TalkSession(&self.client.session)
            .write_chat(&WriteChatReq {
                chat_id: self.id,
                chat_type: chat.chat_type.0,
                msg_id: chat.message_id,
                message: chat.content.message.as_deref(),
                no_seen,
                attachment: chat.content.attachment.as_deref(),
                supplement: chat.content.supplement.as_deref(),
            })
            .await?;

        let logged = res.chatlog.map(Chatlog::from).unwrap_or_else(|| Chatlog {
            channel_id: self.id,

            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),

            sender_id: self.client.user_id,

            send_at: res.send_at,

            chat,

            referer: None,
        });

        {
            let logged = logged.clone();

            self.client
                .pool
                .spawn_task(move |connection| {
                    connection.chat().insert(&ChatRow {
                        log: logged,
                        deleted_time: None,
                    })?;

                    Ok(())
                })
                .await?;
        }

        Ok(logged)
    }

    pub async fn sync_chats(&self, max: LogId) -> ClientResult<usize> {
        let current = {
            let channel_id = self.id;
            self.client
                .pool
                .spawn_task(move |connection| {
                    Ok(connection
                        .chat()
                        .get_latest_log_id_in(channel_id)?
                        .unwrap_or(0))
                })
                .await?
        };

        if current >= max {
            return Ok(0);
        }

        let mut count = 0;

        let (sender, mut recv) = channel(4);

        let database_task = self.client.pool.spawn_task(move |mut connection| {
            while let Some(list) = recv.blocking_recv() {
                let transaction = connection.transaction()?;

                for chatlog in list {
                    transaction.chat().insert(&ChatRow {
                        log: Chatlog::from(chatlog),
                        deleted_time: None,
                    })?;
                }

                transaction.commit()?;
            }

            Ok(())
        });

        let stream = TalkSession(&self.client.session).sync_chat_stream(&SyncChatReq {
            chat_id: self.id,
            current,
            count: 0,
            max,
        });

        pin_mut!(stream);
        while let Some(res) = stream.next().await {
            let res = res?;

            if let Some(chatlogs) = res.chatlogs {
                count += chatlogs.len();
                sender.send(chatlogs).await.ok();
            }
        }

        drop(sender);
        database_task.await?;

        Ok(count)
    }
}
