use crate::KiwiTalkClient;
use kiwi_talk_db::channel::model::ChannelId;
use talk_loco_client::client::{ClientRequestResult, talk::TalkClient};
use talk_loco_command::request::chat::WriteReq;

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

    pub async fn send_chat(&self) -> ClientRequestResult<()> {
        let a = TalkClient(self.client.session()).write(&WriteReq {
            chat_id: todo!(),
            chat_type: todo!(),
            msg_id: todo!(),
            message: todo!(),
            no_seen: todo!(),
            attachment: todo!(),
            supplement: todo!(),
        }).await;
    }
}
