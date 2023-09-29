pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;

use std::{io, pin::pin};

use channel::{user::UserId, ChannelId, ClientChannel};
use config::ClientConfig;
use database::{
    channel::updater::ChannelUpdaterExt,
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
        let update_map: Vec<_> = pool
            .spawn_task(|conn| Ok(conn.channel_updater().get_update_map()?))
            .await?;

        let chat_ids: &Vec<_> = &update_map.iter().map(|(id, _)| *id).collect();
        let max_ids: &Vec<_> = &update_map.iter().map(|(_, max_id)| *max_id).collect();

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

        pool.spawn_task(|mut conn| {
            let transaction = conn.transaction()?;

            for list_data in channel_list_vec.into_iter().flatten() {
                transaction.channel_updater().update(list_data)?;
            }

            transaction.commit()?;

            Ok(())
        })
        .await?;

        Ok(Self {
            user_id: login_res.user_id,
            session,
            pool,
        })
    }
}

#[derive(Debug, Error)]
pub enum LoginError {
    #[error(transparent)]
    Request(#[from] RequestError),

    #[error(transparent)]
    Io(#[from] io::Error),

    #[error(transparent)]
    Database(#[from] PoolTaskError),

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
