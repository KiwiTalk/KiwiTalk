use crate::{
    database::{conversion::chat_model_from_chatlog, spawn_database_task},
    ClientResult, KiwiTalkClient,
};
use kiwi_talk_db::channel::model::ChannelId;
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{request::chat::WriteReq, structs::chat::Chatlog};

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

    pub async fn send_chat(&self) -> ClientResult<Chatlog> {
        let res = TalkClient(self.client.session())
            .write(&WriteReq {
                chat_id: todo!(),
                chat_type: todo!(),
                msg_id: todo!(),
                message: todo!(),
                no_seen: todo!(),
                attachment: todo!(),
                supplement: todo!(),
            })
            .await?;

        let chatlog = res.chatlog.unwrap_or_else(|| Chatlog {
            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),
            chat_id: res.chat_id,
            chat_type: todo!(),
            author_id: todo!(),
            message: todo!(),
            send_at: todo!(),
            attachment: todo!(),
            referer: todo!(),
            supplement: todo!(),
            msg_id: res.msg_id,
        });

        spawn_database_task(self.client.pool().clone(), move |connection| {
            connection
                .chat()
                .insert(&chat_model_from_chatlog(&chatlog))?;

            Ok(())
        })
        .await?;

        Ok(chatlog)
    }
}
