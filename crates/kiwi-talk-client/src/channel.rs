use crate::{
    chat::ChatContent, database::conversion::chat_model_from_chatlog, ClientResult, KiwiTalkClient,
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
}
