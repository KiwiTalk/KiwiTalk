pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;

use std::{io, pin::pin};

use arrayvec::ArrayVec;
use channel::{updater::{ChannelUpdater, UpdateError}, user::UserId, ChannelId, ChannelListData, ClientChannel};
use config::ClientConfig;
use database::{
    channel::{user::UserDatabaseExt, ChannelDatabaseExt},
    chat::ChatDatabaseExt,
    pool::{DatabasePool, PoolTaskError},
};
use error::ClientError;
use futures::TryStreamExt;
use serde::{Deserialize, Serialize};
use talk_loco_client::{
    futures_loco_protocol::session::LocoSession,
    talk::session::{LChatListReq, LoginListReq, SetStReq, TalkSession},
    RequestError,
};
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct KiwiTalkSession {
    user_id: UserId,
    session: LocoSession,
    pool: DatabasePool,
}

impl KiwiTalkSession {
    pub const fn user_id(&self) -> UserId {
        self.user_id
    }

    pub const fn channel(&self, id: ChannelId) -> ClientChannel {
        ClientChannel::new(id, self)
    }

    pub async fn channel_list(&self) -> Result<Vec<ChannelListData>, PoolTaskError> {
        self.pool
            .spawn_task(|mut conn| {
                let update_rows = conn.channel().get_all::<Vec<_>>()?;

                let transaction = conn.transaction()?;

                let mut list_data_vec = Vec::with_capacity(update_rows.capacity());
                for row in update_rows {
                    let last_chat = transaction.chat().get_latest_in(row.id)?.map(|row| row.log);
                    let last_log_id = last_chat
                        .as_ref()
                        .map(|log| log.log_id)
                        .unwrap_or(row.last_seen_log_id);

                    let metas = transaction.channel().get_all_meta_in(row.id)?;

                    let user_count = transaction.user().user_count(row.id)?;

                    list_data_vec.push(ChannelListData {
                        channel_type: row.channel_type,

                        last_chat,
                        last_log_id,
                        last_seen_log_id: row.last_seen_log_id,

                        display_users: ArrayVec::new(),

                        user_count,

                        metas,
                    });
                }

                transaction.commit()?;

                Ok(list_data_vec)
            })
            .await
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkSession(&self.session)
            .set_status(&SetStReq {
                status: client_status as _,
            })
            .await?;

        Ok(())
    }

    pub async fn login(
        session: LocoSession,
        pool: DatabasePool,
        config: ClientConfig<'_>,
        credential: ClientCredential<'_>,
        status: ClientStatus,
    ) -> Result<Self, LoginError> {
        let chat_ids = &[];
        let max_ids = &[];

        let login_res = TalkSession(&session)
            .login(&LoginListReq {
                os: config.os,
                net_type: config.net_type,
                app_version: config.app_version,
                mccmnc: config.mccmnc,
                protocol_version: "1.0",
                device_uuid: credential.device_uuid,
                oauth_token: credential.access_token,
                language: config.language,
                device_type: Some(config.device_type),
                pc_status: Some(status as _),
                revision: None,
                rp: [0x00, 0x00, 0xff, 0xff, 0x00, 0x00],
                chat_list: LChatListReq {
                    chat_ids,
                    max_ids,
                    last_token_id: 0,
                    last_chat_id: None,
                },
                last_block_token: 0,
                background: None,
            })
            .await?;

        let mut channel_list_vec = vec![login_res.chat_list.chat_datas];

        if !login_res.chat_list.eof {
            let mut stream = pin!(TalkSession(&session).channel_list_stream(
                chat_ids,
                max_ids,
                login_res.chat_list.last_token_id.unwrap_or(0),
                login_res.chat_list.last_chat_id
            ));

            while let Some(res) = stream.try_next().await? {
                channel_list_vec.push(res.chat_datas);
            }
        }

        let session = Self {
            user_id: login_res.user_id,
            session,
            pool,
        };

        ChannelUpdater::new(&session)
            .update(channel_list_vec.into_iter().flatten())
            .await?;

        Ok(session)
    }
}

#[derive(Debug, Error)]
pub enum LoginError {
    #[error(transparent)]
    Request(#[from] RequestError),

    #[error(transparent)]
    Io(#[from] io::Error),

    #[error(transparent)]
    Update(#[from] UpdateError),

    #[error("session closed")]
    SessionClosed,
}

#[derive(Debug, Clone, Copy)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
}

#[repr(i32)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ClientStatus {
    Unlocked = 1,
    Locked = 2,
}

pub type ClientResult<T> = Result<T, ClientError>;
