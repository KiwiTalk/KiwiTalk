pub mod normal;
pub mod open;
pub mod user;
pub(crate) mod loader;

use crate::{
    chat::{Chat, LogId, LoggedChat},
    database::{
        channel::{ChannelDatabaseExt, ChannelModel, ChannelTrackingData},
        chat::{ChatDatabaseExt, ChatModel},
    },
    ClientConnection, ClientResult,
};
use futures::{pin_mut, StreamExt};
use nohash_hasher::IntMap;
use serde::{Deserialize, Serialize};
use smallvec::SmallVec;
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::structs::channel_info::ChannelMeta as LocoChannelMeta;
use talk_loco_command::{
    request::chat::{SyncMsgReq, UpdateChatReq, WriteReq},
    structs::channel_info::ChannelInfo,
};
use tokio::sync::mpsc::channel;

use self::{user::DisplayUser, normal::NormalChannelData};

pub type ChannelId = i64;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChannelSettings {
    pub push_alert: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChannelData {
    pub channel_type: String,

    pub display_users: SmallVec<[DisplayUser; 4]>,

    pub metas: IntMap<i32, ChannelMeta>,

    pub settings: ChannelSettings,
}

impl From<ChannelInfo> for ChannelData {
    fn from(info: ChannelInfo) -> Self {
        let display_users = info
            .display_members
            .into_iter()
            .map(DisplayUser::from)
            .collect();

        let metas = info
            .channel_metas
            .into_iter()
            .map(|meta| (meta.meta_type, ChannelMeta::from(meta)))
            .collect();

        Self {
            channel_type: info.channel_type,
            display_users,
            metas,
            settings: ChannelSettings {
                push_alert: info.push_alert,
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone)]
pub struct ChannelInitialData {
    pub id: ChannelId,

    pub last_chat_log_id: LogId,
    pub last_seen_log_id: LogId,

    pub data: ChannelData,
}

impl From<ChannelInfo> for ChannelInitialData {
    fn from(info: ChannelInfo) -> Self {
        Self {
            id: info.chat_id,

            last_chat_log_id: info.last_log_id,
            last_seen_log_id: info.last_seen_log_id,

            data: ChannelData::from(info),
        }
    }
}

impl ChannelInitialData {
    pub fn create_channel_model(&self, last_update: i64) -> ChannelModel {
        ChannelModel {
            id: self.id,
            channel_type: self.data.channel_type.clone(),
            tracking_data: ChannelTrackingData {
                last_chat_log_id: self.last_chat_log_id,
                last_seen_log_id: self.last_seen_log_id,
                last_update,
            },
            settings: self.data.settings.clone(),
        }
    }
}

#[derive(Debug, Clone)]
pub enum ChannelDataVariant {
    Normal(NormalChannelData),
    Open(()),
}

#[derive(Debug, Clone, Copy)]
pub struct ClientChannel<'a> {
    id: ChannelId,

    connection: &'a ClientConnection,
}

impl<'a> ClientChannel<'a> {
    #[inline(always)]
    pub const fn new(id: ChannelId, connection: &'a ClientConnection) -> Self {
        Self { id, connection }
    }

    #[inline(always)]
    pub const fn channel_id(&self) -> ChannelId {
        self.id
    }
}

impl ClientChannel<'_> {
    pub async fn send_chat(&self, chat: Chat, no_seen: bool) -> ClientResult<LoggedChat> {
        let res = TalkClient(&self.connection.session)
            .write(&WriteReq {
                chat_id: self.id,
                chat_type: chat.chat_type,
                msg_id: chat.message_id,
                message: chat.content.message.clone(),
                no_seen,
                attachment: chat.content.attachment.clone(),
                supplement: chat.content.supplement.clone(),
            })
            .await?;

        let logged = res
            .chatlog
            .map(LoggedChat::from)
            .unwrap_or_else(|| LoggedChat {
                channel_id: self.id,

                log_id: res.log_id,
                prev_log_id: Some(res.prev_id),

                sender_id: self.connection.user_id,

                send_at: res.send_at,

                chat,

                referer: None,
            });

        {
            let logged = logged.clone();

            self.connection
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
        let client = TalkClient(&self.connection.session);

        let current = {
            let channel_id = self.id;
            self.connection
                .pool
                .spawn_task(move |connection| {
                    Ok(connection
                        .channel()
                        .get_last_chat_log_id(channel_id)?
                        .unwrap_or(0))
                })
                .await?
        };

        if current >= max {
            return Ok(0);
        }

        let mut count = 0;

        let (sender, mut recv) = channel(4);

        let database_task = self.connection.pool.spawn_task(move |mut connection| {
            let transaction = connection.transaction()?;

            while let Some(list) = recv.blocking_recv() {
                for chatlog in list {
                    transaction.chat().insert(&ChatModel {
                        logged: LoggedChat::from(chatlog),
                        deleted_time: None,
                    })?;
                }
            }

            transaction.commit()?;
            Ok(())
        });

        let stream = client.sync_chat_stream(&SyncMsgReq {
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
        TalkClient(&self.connection.session)
            .update_channel(&UpdateChatReq {
                chat_id: self.id,
                push_alert,
            })
            .await?;

        let channel_id = self.id;
        self.connection
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
