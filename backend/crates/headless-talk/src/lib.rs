pub mod channel;
pub mod chat;
pub mod config;
mod constants;
pub mod database;
pub mod event;
mod handler;
pub mod initializer;

use std::pin::pin;

use channel::{user::UserId, ChannelId};
use database::pool::{DatabasePool, PoolTaskError};
use futures::TryStreamExt;
use talk_loco_client::{
    futures_loco_protocol::session::LocoSession,
    talk::session::{ChatOnChannelReq, SetStReq, SyncChatReq, TalkSession},
    RequestError,
};
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct HeadlessTalk {
    user_id: UserId,
    session: LocoSession,
    pool: DatabasePool,
}

impl HeadlessTalk {
    pub const fn user_id(&self) -> UserId {
        self.user_id
    }

    pub async fn open_channel(&self, id: ChannelId) -> ClientResult<()> {
        let session = TalkSession(&self.session);

        let res = session
            .chat_on_channel(&ChatOnChannelReq {
                chat_id: id,
                token: todo!(),
                open_token: todo!(),
            })
            .await?;

        let sync_stream = pin!(session.sync_chat_stream(&SyncChatReq {
            chat_id: id,
            current: todo!(),
            count: 300,
            max: todo!(),
        }));

        while let Some(res) = sync_stream.try_next().await? {
            let chatlogs = match res.chatlogs {
                Some(chatlogs) => chatlogs,
                _ => continue,
            };

            
        }

        todo!()
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkSession(&self.session)
            .set_status(&SetStReq {
                status: client_status as _,
            })
            .await?;

        Ok(())
    }
}

#[repr(i32)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClientStatus {
    Unlocked = 1,
    Locked = 2,
}

pub type ClientResult<T> = Result<T, ClientError>;

#[derive(Debug, Error)]
#[error(transparent)]
pub enum ClientError {
    Request(#[from] RequestError),
    Database(#[from] PoolTaskError),
}
