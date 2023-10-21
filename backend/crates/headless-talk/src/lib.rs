pub mod channel;
pub mod config;
mod constants;
pub mod database;
pub mod event;
mod handler;
pub mod initializer;

pub use talk_loco_client;

use database::{DatabasePool, PoolTaskError};
use talk_loco_client::{
    futures_loco_protocol::session::LocoSession, talk::session::TalkSession, RequestError,
};
use thiserror::Error;
use tokio::task::JoinHandle;

#[derive(Debug)]
pub struct HeadlessTalk {
    user_id: i64,
    session: LocoSession,
    pool: DatabasePool,

    task_handle: JoinHandle<()>,
}

impl HeadlessTalk {
    pub const fn user_id(&self) -> i64 {
        self.user_id
    }

    pub async fn open_channel(&self, id: i64) -> ClientResult<()> {
        

        todo!()
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkSession(&self.session)
            .set_status(client_status as _)
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
