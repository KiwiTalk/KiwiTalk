pub mod normal;
pub mod open;
pub mod user;

use std::ops::DerefMut;

use crate::{
    chat::{Chat, LogId, LoggedChat},
    database::{
        chat::{ChatDatabaseExt, ChatModel},
        KiwiTalkConnectionExt,
    },
    ClientConnection, ClientResult,
};
use futures::{pin_mut, StreamExt};
use nohash_hasher::IntMap;
use rusqlite::DropBehavior;
use serde::{Deserialize, Serialize};
use smallvec::SmallVec;
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::request::chat::{SyncMsgReq, UpdateChatReq, WriteReq};
use tokio::sync::mpsc::channel;

use self::user::DisplayUser;

pub type ChannelId = i64;

#[derive(Debug, Clone)]
pub struct ChannelData {
    pub channel_type: String,

    pub display_users: SmallVec<[DisplayUser; 4]>,

    pub metas: IntMap<i32, ChannelMeta>,

    pub push_alert: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelMeta {
    pub author_id: i64,

    pub updated_at: i64,
    pub revision: i64,

    pub content: String,
}

#[derive(Debug)]
pub struct ClientChannelList<'a, Inner> {
    connection: &'a ClientConnection,
    inner: &'a Inner,
}

impl<'a, Inner> ClientChannelList<'a, Inner> {
    #[inline(always)]
    pub const fn new(connection: &'a ClientConnection, inner: &'a Inner) -> Self {
        Self { connection, inner }
    }

    #[inline(always)]
    pub const fn inner(&self) -> &Inner {
        self.inner
    }
}

#[derive(Debug, Clone)]
pub struct ClientChannel<'a, Inner> {
    id: ChannelId,

    connection: &'a ClientConnection,
    inner: Inner,
}

impl<'a, Inner> ClientChannel<'a, Inner> {
    #[inline(always)]
    pub const fn new(id: ChannelId, connection: &'a ClientConnection, inner: Inner) -> Self {
        Self {
            id,
            connection,
            inner,
        }
    }

    #[inline(always)]
    pub const fn channel_id(&self) -> ChannelId {
        self.id
    }

    #[inline(always)]
    pub const fn inner(&self) -> &Inner {
        &self.inner
    }

    #[inline(always)]
    pub const fn inner_mut(&mut self) -> &Inner {
        &mut self.inner
    }
}

impl<Data: AsMut<ChannelData>, D: DerefMut<Target = Data>> ClientChannel<'_, D> {
    pub async fn send_chat(&mut self, chat: Chat, no_seen: bool) -> ClientResult<LoggedChat> {
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
                    connection.insert_chat(&ChatModel {
                        logged,
                        deleted: false,
                    })?;

                    Ok(())
                })
                .await?;
        }

        Ok(logged)
    }

    pub async fn sync_chats(&mut self, max: LogId) -> ClientResult<usize> {
        let client = TalkClient(&self.connection.session);

        let current = {
            let channel_id = self.id;
            self.connection
                .pool
                .spawn_task(move |connection| {
                    Ok(connection
                        .channel()
                        .get_last_chat_log_id(channel_id)
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
            let mut transaction = connection.transaction()?;
            transaction.set_drop_behavior(DropBehavior::Commit);

            while let Some(list) = recv.blocking_recv() {
                for chatlog in list {
                    transaction.insert_chat(&ChatModel {
                        logged: LoggedChat::from(chatlog),
                        deleted: false,
                    })?;
                }
            }

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

    pub async fn update(&mut self, push_alert: bool) -> ClientResult<()> {
        TalkClient(&self.connection.session)
            .update_channel(&UpdateChatReq {
                chat_id: self.id,
                push_alert,
            })
            .await?;

        self.inner.as_mut().push_alert = push_alert;

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
