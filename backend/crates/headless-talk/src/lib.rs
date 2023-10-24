pub mod channel;
pub mod config;
mod constants;
mod database;
pub mod event;
pub mod handler;
pub mod initializer;

use channel::{
    normal::{self, NormalChannel},
    ChannelListItem, ClientChannel,
};
use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, RunQueryDsl};
pub use talk_loco_client;

use database::{model::channel::ChannelListRow, schema::channel_list, DatabasePool, PoolTaskError};
use futures_loco_protocol::session::LocoSession;
use talk_loco_client::{
    talk::{
        channel::ChannelType,
        session::{channel::chat_on::ChatOnChannelType, TalkSession},
    },
    RequestError,
};
use thiserror::Error;
use tokio::task::JoinHandle;

use crate::database::schema::chat;

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

    pub async fn channel_list(&self) -> Result<Vec<(i64, ChannelListItem)>, PoolTaskError> {
        let rows = self
            .pool
            .spawn(|conn| {
                let rows = channel_list::table
                    .select(channel_list::all_columns)
                    .load::<ChannelListRow>(conn)?;

                Ok(rows)
            })
            .await?;

        let mut list = Vec::with_capacity(rows.capacity());

        for row in rows {
            let ty = ChannelType::from(row.channel_type.as_str());

            match ty {
                ChannelType::DirectChat | ChannelType::MultiChat | ChannelType::MemoChat => {
                    list.push((row.id, normal::load_list_item(&self.pool, ty, row).await?));
                }

                _ => {}
            }
        }

        Ok(list)
    }

    pub async fn open_channel(&self, id: i64) -> ClientResult<Option<ClientChannel>> {
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

        Ok(match res.channel_type {
            ChatOnChannelType::DirectChat(_normal)
            | ChatOnChannelType::MultiChat(_normal)
            | ChatOnChannelType::MemoChat(_normal) => {
                Some(ClientChannel::Normal(NormalChannel::new(id, self)))
            }

            _ => None,
        })
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
