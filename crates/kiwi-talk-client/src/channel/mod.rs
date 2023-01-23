pub mod normal;
pub mod open;

use std::ops::DerefMut;

use crate::{
    chat::ChatContent, database::conversion::chat_model_from_chatlog, ClientConnection,
    ClientResult,
};
use futures::{pin_mut, StreamExt};
use kiwi_talk_db::{channel::model::ChannelId, chat::model::LogId};
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{
    request::chat::{SyncMsgReq, UpdateChatReq, WriteReq},
    structs::chat::Chatlog,
};
use tokio::sync::mpsc::channel;

#[derive(Debug)]
pub struct ClientChannelList<'a, Data> {
    connection: &'a ClientConnection,
    data: Data,
}

impl<'a, Data> ClientChannelList<'a, Data> {
    #[inline(always)]
    pub const fn new(connection: &'a ClientConnection, data: Data) -> Self {
        Self { connection, data }
    }

    #[inline(always)]
    pub const fn data(&self) -> &Data {
        &self.data
    }
}

#[derive(Debug, Clone)]
pub struct ChannelData {
    pub channel_type: String,

    pub last_log_id: i64,
    pub last_seen_log_id: i64,
    pub last_chat: Option<Chatlog>,

    pub active_user_count: i32,

    pub unread_count: i32,

    pub push_alert: bool,
}

#[derive(Debug, Clone)]
pub struct ClientChannel<'a, Data> {
    id: ChannelId,

    connection: &'a ClientConnection,
    data: Data,
}

impl<'a, Data> ClientChannel<'a, Data> {
    #[inline(always)]
    pub const fn new(id: ChannelId, connection: &'a ClientConnection, data: Data) -> Self {
        Self {
            id,
            connection,
            data,
        }
    }

    #[inline(always)]
    pub const fn channel_id(&self) -> ChannelId {
        self.id
    }

    #[inline(always)]
    pub const fn data(&self) -> &Data {
        &self.data
    }
}

impl<Data: AsMut<ChannelData>, D: DerefMut<Target = Data>> ClientChannel<'_, D> {
    pub async fn send_chat(&self, chat: ChatContent, no_seen: bool) -> ClientResult<Chatlog> {
        let res = TalkClient(&self.connection.session)
            .write(&WriteReq {
                chat_id: self.id,
                chat_type: chat.chat_type,
                msg_id: 0,
                message: chat.message.clone(),
                no_seen,
                attachment: chat.attachment.clone(),
                supplement: chat.supplement.clone(),
            })
            .await?;

        let chatlog = res.chatlog.unwrap_or_else(|| Chatlog {
            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),
            chat_id: res.chat_id,
            chat_type: chat.chat_type,
            author_id: self.connection.user_id,
            message: chat.message,
            send_at: res.send_at,
            attachment: chat.attachment,
            referer: None,
            supplement: chat.supplement,
            msg_id: res.msg_id,
        });

        {
            let chatlog = chatlog.clone();

            self.connection
                .pool
                .spawn_task(move |connection| {
                    connection
                        .chat()
                        .insert(&chat_model_from_chatlog(&chatlog))?;

                    Ok(())
                })
                .await?;
        }

        Ok(chatlog)
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

        let database_task = self.connection.pool.spawn_task(move |connection| {
            while let Some(list) = recv.blocking_recv() {
                for chatlog in list {
                    connection
                        .chat()
                        .insert(&chat_model_from_chatlog(&chatlog))?;
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
