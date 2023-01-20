use crate::{
    chat::ChatContent, database::conversion::chat_model_from_chatlog, ClientResult, KiwiTalkClient,
};
use futures::{pin_mut, StreamExt};
use kiwi_talk_db::{channel::model::ChannelId, chat::model::LogId};
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{
    request::chat::{NotiReadReq, SyncMsgReq, UpdateChatReq, WriteReq, ChatOnRoomReq},
    structs::chat::Chatlog,
};
use tokio::sync::mpsc::channel;

#[derive(Debug, Clone, Copy)]
pub struct KiwiTalkClientChannel<'a> {
    client: &'a KiwiTalkClient,
    channel_id: ChannelId,
}

impl<'a> KiwiTalkClientChannel<'a> {
    pub const fn new(client: &'a KiwiTalkClient, channel_id: ChannelId) -> Self {
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
                    Ok(
                        connection
                            .channel()
                            .get_last_chat_log_id(channel_id)
                            .unwrap_or(0),
                    )
                })
                .await?
        };
        
        if current >= max {
            return Ok(0);
        }

        let mut count = 0;

        let stream = client.sync_chat_stream(&SyncMsgReq {
            chat_id: self.channel_id,
            current,
            count: 300,
            max,
        });

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

        pin_mut!(stream);
        while let Some(res) = stream.next().await {
            let res = res?;

            count += res.chat_logs.len();
            sender.send(res.chat_logs).await.ok();
        }

        database_task.await?;

        Ok(count)
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
