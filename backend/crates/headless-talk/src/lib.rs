pub mod channel;
pub mod config;
mod constants;
mod database;
pub mod event;
pub mod handler;
pub mod initializer;

use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, RunQueryDsl};
pub use talk_loco_client;

use database::{model::channel::ChannelListRow, schema::channel_list, DatabasePool, PoolTaskError};
use futures_loco_protocol::session::LocoSession;
use talk_loco_client::{
    talk::session::{channel::chat_on::ChatOnChannelType, TalkSession},
    RequestError,
};
use thiserror::Error;
use tokio::task::JoinHandle;

use crate::database::schema::{self, chat};

#[derive(Debug)]
pub struct HeadlessTalk {
    user_id: i64,
    session: LocoSession,
    pool: DatabasePool,

    ping_task: JoinHandle<()>,
    stream_task: JoinHandle<()>,
}

impl HeadlessTalk {
    pub const fn user_id(&self) -> i64 {
        self.user_id
    }

    pub async fn channel_list(&self) -> Result<Vec<ChannelListRow>, PoolTaskError> {
        Ok(self
            .pool
            .spawn(|conn| {
                let list = channel_list::table
                    .select(channel_list::all_columns)
                    .load::<ChannelListRow>(conn)?;

                Ok(list)
            })
            .await?)
    }

    pub async fn open_channel(&self, id: i64) -> ClientResult<()> {
        let last_log_id = self
            .pool
            .spawn(move |conn| {
                Ok(chat::table
                    .filter(chat::channel_id.eq(id))
                    .select(chat::log_id)
                    .order_by(chat::log_id.desc())
                    .first::<i64>(conn)
                    .optional()?)
            })
            .await?;

        let res = TalkSession(&self.session)
            .channel(id)
            .chat_on(last_log_id)
            .await?;

        match res.channel_type {
            ChatOnChannelType::DirectChat(normal)
            | ChatOnChannelType::MultiChat(normal)
            | ChatOnChannelType::MemoChat(normal) => {}

            ChatOnChannelType::OpenDirect(open) | ChatOnChannelType::OpenMulti(open) => {
                
            }

            _ => {}
        }

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
        self.ping_task.abort();
        self.stream_task.abort();
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
