// pub(crate) mod loader;
pub mod normal;
pub mod open;
pub mod user;

use crate::{
    chat::{Chat, Chatlog, LogId},
    database::{
        channel::{ChannelDatabaseExt, ChannelModel, ChannelTrackingData},
        chat::{ChatDatabaseExt, ChatModel},
    },
    ClientResult, KiwiTalkSession,
};
use futures::{pin_mut, StreamExt};
use nohash_hasher::IntMap;
use serde::{Deserialize, Serialize};
use talk_loco_client::{
    structs::channel::{ChannelInfo, ChannelMeta as LocoChannelMeta},
    talk::{SyncChatReq, TalkSession, UpdateChannelReq, WriteChatReq},
};
use tokio::sync::mpsc::channel;

use self::normal::NormalChannelData;

pub type ChannelId = i64;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChannelSettings {
    pub push_alert: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChannelData {
    pub channel_type: String,

    pub last_chat: Option<Chatlog>,
    pub last_seen_log_id: LogId,

    pub metas: IntMap<i32, ChannelMeta>,

    pub settings: ChannelSettings,
}

impl ChannelData {
    pub fn create_model(&self, id: i64, last_update: i64) -> ChannelModel {
        ChannelModel {
            id,
            channel_type: self.channel_type.clone(),
            tracking_data: ChannelTrackingData {
                last_seen_log_id: self.last_seen_log_id,
                last_update,
            },
            settings: self.settings.clone(),
        }
    }
}

impl From<ChannelInfo> for ChannelData {
    fn from(info: ChannelInfo) -> Self {
        let metas = info
            .channel_metas
            .into_iter()
            .map(|meta| (meta.meta_type, ChannelMeta::from(meta)))
            .collect();

        Self {
            channel_type: info.channel_type,

            last_chat: info.last_chat_log.map(Chatlog::from),
            last_seen_log_id: info.last_seen_log_id,

            metas,
            settings: ChannelSettings {
                push_alert: info.push_alert,
            },
        }
    }
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
                    connection.chat().insert(&ChatModel {
                        logged,
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
                    transaction.chat().insert(&ChatModel {
                        logged: Chatlog::from(chatlog),
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

    pub async fn update(&self, push_alert: bool) -> ClientResult<()> {
        TalkSession(&self.client.session)
            .update_channel(&UpdateChannelReq {
                chat_id: self.id,
                push_alert,
            })
            .await?;

        let channel_id = self.id;
        self.client
            .pool
            .spawn_task(move |connection| {
                connection
                    .channel()
                    .set_push_alert(channel_id, push_alert)?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}
