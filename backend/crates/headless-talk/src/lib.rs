pub mod channel;
mod conn;
mod constants;
mod database;
pub mod event;
pub mod handler;
pub mod init;
mod task;
mod updater;
pub mod user;

use channel::{
    load_list_item,
    normal::{self, NormalChannelOp},
    open::OpenChannelOp,
    ChannelListItem, ChannelOp, ClientChannel,
};
use conn::Conn;
use diesel::{BoolExpressionMethods, ExpressionMethods, QueryDsl, RunQueryDsl};

use database::{
    model::channel::ChannelListRow,
    schema::{channel_list, user_profile},
    PoolTaskError,
};
use talk_loco_client::{
    talk::session::{channel::chat_on::ChatOnChannelType, TalkSession},
    RequestError,
};
use task::BackgroundTask;
use thiserror::Error;

pub use talk_loco_client;

#[derive(Debug)]
pub struct HeadlessTalk {
    pub conn: Conn,

    pub _ping_task: BackgroundTask,
    pub _stream_task: BackgroundTask,
}

impl HeadlessTalk {
    pub fn user_id(&self) -> i64 {
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

    pub async fn load_channel(&self, id: i64) -> ClientResult<Option<ClientChannel>> {
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

        if let (Some(active_user_ids), Some(watermarks)) = (res.active_user_ids, res.watermarks) {
            let active_user_count = active_user_ids.len() as i32;
            let watermark_iter = active_user_ids.into_iter().zip(watermarks.into_iter());

            self.conn
                .pool
                .spawn_transaction(move |conn| {
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

                    Ok(())
                })
                .await?;
        }

        Ok(match res.channel_type {
            ChatOnChannelType::DirectChat(normal)
            | ChatOnChannelType::MultiChat(normal)
            | ChatOnChannelType::MemoChat(normal) => Some(ClientChannel::Normal(
                normal::load_channel(id, &self.conn, normal).await?,
            )),

            _ => None,
        })
    }

    pub fn channel(&self, id: i64) -> ChannelOp<'_> {
        ChannelOp::new(id, &self.conn)
    }

    pub fn normal_channel(&self, id: i64) -> NormalChannelOp<'_> {
        NormalChannelOp::new(id, &self.conn)
    }

    pub fn open_channel(&self, id: i64, link_id: i64) -> OpenChannelOp<'_> {
        OpenChannelOp::new(id, link_id, &self.conn)
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkSession(&self.conn.session)
            .set_status(client_status as _)
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
