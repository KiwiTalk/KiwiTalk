pub mod channel;
mod conn;
mod constants;
mod database;
pub mod event;
pub mod handler;
pub mod init;
mod updater;
pub mod user;

use channel::{load_list_item, normal, ChannelListItem, ClientChannel};
use conn::Conn;
use diesel::{BoolExpressionMethods, Connection, ExpressionMethods, QueryDsl, RunQueryDsl};
pub use talk_loco_client;

use database::{
    model::channel::ChannelListRow,
    schema::{channel_list, user_profile},
    PoolTaskError,
};
use talk_loco_client::{
    talk::session::{channel::chat_on::ChatOnChannelType, TalkSession},
    RequestError,
};
use thiserror::Error;
use tokio::task::JoinHandle;

#[derive(Debug)]
pub struct HeadlessTalk {
    pub(crate) conn: Conn,

    ping_task: JoinHandle<()>,
    stream_task: JoinHandle<()>,
}

impl HeadlessTalk {
    pub const fn user_id(&self) -> i64 {
        self.conn.user_id
    }

    pub async fn channel_list(&self) -> Result<Vec<(i64, ChannelListItem)>, PoolTaskError> {
        let rows = self
            .conn
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
            if let Some(list_item) = load_list_item(&self.conn.pool, &row).await? {
                list.push((row.id, list_item))
            }
        }

        Ok(list)
    }

    pub async fn open_channel(&self, id: i64) -> ClientResult<Option<ClientChannel>> {
        let last_seen_log_id = self
            .conn
            .pool
            .spawn(move |conn| {
                let last_seen_log_id: Option<i64> = channel_list::table
                    .filter(channel_list::id.eq(id))
                    .select(channel_list::last_seen_log_id)
                    .first::<Option<i64>>(conn)?;

                Ok(last_seen_log_id)
            })
            .await?;

        let res = TalkSession(&self.conn.session)
            .channel(id)
            .chat_on(last_seen_log_id)
            .await?;

        let channel = match res.channel_type {
            ChatOnChannelType::DirectChat(normal)
            | ChatOnChannelType::MultiChat(normal)
            | ChatOnChannelType::MemoChat(normal) => {
                ClientChannel::Normal(normal::open_channel(id, self, normal).await?)
            }

            _ => return Ok(None),
        };

        if let (Some(active_user_ids), Some(watermarks)) = (res.active_user_ids, res.watermarks) {
            let active_user_count = active_user_ids.len() as i32;
            let watermark_iter = active_user_ids.into_iter().zip(watermarks.into_iter());

            self.conn
                .pool
                .spawn(move |conn| {
                    conn.transaction(|conn| {
                        diesel::update(channel_list::table)
                            .filter(channel_list::id.eq(id))
                            .set(channel_list::active_user_count.eq(active_user_count))
                            .execute(conn)?;

                        for (user_id, watermark) in watermark_iter {
                            diesel::update(user_profile::table)
                                .filter(
                                    user_profile::channel_id
                                        .eq(id)
                                        .and(user_profile::id.eq(user_id)),
                                )
                                .set(user_profile::watermark.eq(watermark))
                                .execute(conn)?;
                        }

                        Ok::<_, PoolTaskError>(())
                    })?;

                    Ok(())
                })
                .await?;
        }

        Ok(Some(channel))
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkSession(&self.conn.session)
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
