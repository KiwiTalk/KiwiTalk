use futures_loco_protocol::session::LocoSession;
use talk_loco_client::talk::session::{channel::info::ChannelInfoType, TalkSession};

use crate::{database::DatabasePool, ClientResult};

#[derive(Debug)]
pub struct ChannelInitializer<'a> {
    session: &'a LocoSession,
    pool: &'a DatabasePool,

    id: i64,
}

impl<'a> ChannelInitializer<'a> {
    pub fn new(session: &'a LocoSession, pool: &'a DatabasePool, id: i64) -> Self {
        Self { session, pool, id }
    }

    pub async fn initialize(self) -> ClientResult<()> {
        let res = TalkSession(self.session).channel(self.id).info().await?;

        match res.channel_type {
            ChannelInfoType::DirectChat(normal)
            | ChannelInfoType::MultiChat(normal)
            | ChannelInfoType::MemoChat(normal) => {
                let list = TalkSession(self.session)
                    .normal_channel(self.id)
                    .list_users()
                    .await?;
            }

            ChannelInfoType::OpenMulti(open) | ChannelInfoType::OpenDirect(open) => {
                let list = TalkSession(self.session)
                    .open_channel(self.id, open.link.link_id)
                    .list_users()
                    .await?;
            }

            ChannelInfoType::Other => return Ok(()),
        }

        Ok(())
    }
}
