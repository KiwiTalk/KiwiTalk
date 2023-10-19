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
use tokio::task::JoinHandle;

use crate::{
    channel::{ChannelKind, ChannelTypeExt},
    database::{channel::ChannelDatabaseExt, chat::ChatDatabaseExt},
};

#[derive(Debug)]
pub struct HeadlessTalk {
    user_id: UserId,
    session: LocoSession,
    pool: DatabasePool,

    task_handle: JoinHandle<()>,
}

impl HeadlessTalk {
    pub const fn user_id(&self) -> UserId {
        self.user_id
    }

    pub async fn open_channel(&self, id: ChannelId) -> ClientResult<()> {
        let (a, last_log_id) = self
            .pool
            .spawn(move |conn| {
                Ok((
                    conn.channel().get(id)?,
                    conn.chat().get_latest_log_id_in(id)?.unwrap_or(0),
                ))
            })
            .await?;

        let session = TalkSession(&self.session);

        let res = session
            .chat_on_channel(&ChatOnChannelReq {
                chat_id: id,
                token: last_log_id,
                open_token: todo!(),
            })
            .await?;

        match res.chat_type.kind() {
            ChannelKind::Normal => {}
            ChannelKind::Open => {}
            ChannelKind::Unknown => {}
        }

        let sync_stream = pin!(session.sync_chat_stream(&SyncChatReq {
            chat_id: id,
            current: last_log_id,
            count: 300,
            max: a.as_ref().map(|a| a.last_seen_log_id).unwrap_or(0),
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

impl Drop for HeadlessTalk {
    fn drop(&mut self) {
        self.task_handle.abort();
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
