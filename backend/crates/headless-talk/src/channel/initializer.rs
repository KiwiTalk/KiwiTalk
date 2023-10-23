use futures_loco_protocol::session::LocoSession;
use talk_loco_client::talk::session::{TalkSession, channel::info::ChannelInfoType};

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
            ChannelInfoType::DirectChat(_) => todo!(),
            ChannelInfoType::MultiChat(_) => todo!(),
            ChannelInfoType::MemoChat(_) => todo!(),
            ChannelInfoType::OpenDirect(_) => todo!(),
            ChannelInfoType::OpenMulti(_) => todo!(),
            ChannelInfoType::Other => todo!(),
        }

        Ok(())
    }
}
