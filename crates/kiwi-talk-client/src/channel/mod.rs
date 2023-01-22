use crate::{
    chat::ChatContent,
    database::conversion::{channel_user_model_from_user_variant, chat_model_from_chatlog},
    ClientResult, KiwiTalkClientShared,
};
use futures::{pin_mut, StreamExt};
use kiwi_talk_db::{channel::model::ChannelId, chat::model::LogId};
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{
    request::chat::{
        ChatInfoReq, ChatOnRoomReq, MemberReq, NotiReadReq, SyncMsgReq, UpdateChatReq, WriteReq,
    },
    structs::{channel_info::ChannelInfo, chat::Chatlog},
};
use tokio::sync::mpsc::channel;

#[derive(Debug, Clone)]
pub struct KiwiTalkChannelData {
    id: ChannelId,

    channel_type: String,

    last_log_id: i64,
    last_seen_log_id: i64,
    last_chat: Option<Chatlog>,

    active_user_count: i32,

    unread_count: i32,

    push_alert: bool,
}

#[derive(Debug, Clone, Copy)]
pub struct KiwiTalkClientChannel<'a> {
    client: &'a KiwiTalkClientShared,
    channel_id: ChannelId,
}

impl<'a> KiwiTalkClientChannel<'a> {
    pub const fn new(client: &'a KiwiTalkClientShared, channel_id: ChannelId) -> Self {
        Self { client, channel_id }
    }

    #[inline(always)]
    pub const fn channel_id(&self) -> ChannelId {
        self.channel_id
    }

    pub async fn send_chat(&self, chat: ChatContent, no_seen: bool) -> ClientResult<Chatlog> {
        let res = TalkClient(self.client.session())
            .write(&WriteReq {
                chat_id: self.channel_id,
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
            author_id: self.client.user_id(),
            message: chat.message,
            send_at: res.send_at,
            attachment: chat.attachment,
            // TODO::
            referer: None,
            supplement: chat.supplement,
            msg_id: res.msg_id,
        });

        {
            let chatlog = chatlog.clone();

            self.client
                .pool()
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

    pub async fn read_chat(&self, log_id: LogId) -> ClientResult<()> {
        TalkClient(self.client.session())
            .read_chat(&NotiReadReq {
                chat_id: self.channel_id,
                watermark: log_id,
                link_id: None,
            })
            .await?;

        let client_user_id = self.client.user_id();
        let channel_id = self.channel_id;
        self.client
            .pool()
            .spawn_task(move |connection| {
                connection
                    .channel()
                    .set_last_seen_log_id(channel_id, log_id)?;
                connection
                    .user()
                    .update_watermark(client_user_id, channel_id, log_id)?;

                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn sync_chats(&self, max: LogId) -> ClientResult<usize> {
        let client = TalkClient(self.client.session());

        let current = {
            let channel_id = self.channel_id;
            self.client
                .pool()
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

        let database_task = self.client.pool().spawn_task(move |connection| {
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
            chat_id: self.channel_id,
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

    pub async fn chat_on(&self) -> ClientResult<()> {
        let res = TalkClient(self.client.session())
            .chat_on_channel(&ChatOnRoomReq {
                chat_id: self.channel_id,
                token: 0,
                open_token: None,
            })
            .await?;

        self.sync_chats(res.last_log_id).await?;

        let users = match res.users {
            Some(users) => users,
            None => {
                let res = TalkClient(self.client.session())
                    .user_info(&MemberReq {
                        chat_id: self.channel_id,
                        user_ids: res.user_ids.unwrap_or_default(),
                    })
                    .await?;

                res.members
            }
        };

        let channel_id = self.channel_id;
        self.client
            .pool()
            .spawn_task(move |connection| {
                connection
                    .channel()
                    .set_last_chat_log_id(channel_id, res.last_log_id)?;

                for user in users {
                    connection
                        .user()
                        .insert(&channel_user_model_from_user_variant(channel_id, 0, &user))?;
                }

                for (id, watermark) in res.watermark_user_ids.into_iter().zip(res.watermarks) {
                    connection
                        .user()
                        .update_watermark(id, channel_id, watermark)?;
                }

                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn info(&self) -> ClientResult<ChannelInfo> {
        let res = TalkClient(self.client.session())
            .channel_info(&ChatInfoReq {
                chat_id: self.channel_id,
            })
            .await?;

        Ok(res.chat_info)
    }

    pub async fn update(&self, push_alert: bool) -> ClientResult<()> {
        TalkClient(self.client.session())
            .update_channel(&UpdateChatReq {
                chat_id: self.channel_id,
                push_alert,
            })
            .await?;

        let channel_id = self.channel_id;
        self.client
            .pool()
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

#[derive(Debug, Clone)]
pub struct ChannelData {}
