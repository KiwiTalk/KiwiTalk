pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;
pub mod status;

use std::{io, pin::pin};

use channel::{normal::ClientNormalChannel, user::UserId, ChannelId, ClientChannel};
use config::ClientConfig;
use database::pool::DatabasePool;
use error::ClientError;
use futures::{AsyncRead, AsyncWrite, StreamExt, TryStreamExt};
use status::ClientStatus;
use talk_loco_client::{
    session::LocoSession,
    talk::{LChatListReq, LoginListReq, SetStReq, TalkSession},
    LocoClient, RequestError,
};
use thiserror::Error;
use tokio::select;

#[derive(Debug, Clone)]
pub struct KiwiTalkClient {
    user_id: UserId,
    session: LocoSession,
    pool: DatabasePool,
}

impl KiwiTalkClient {
    pub const fn user_id(&self) -> UserId {
        self.user_id
    }

    pub const fn session(&self) -> TalkSession {
        TalkSession(&self.session)
    }

    pub const fn pool(&self) -> &DatabasePool {
        &self.pool
    }

    pub const fn channel(&self, id: ChannelId) -> ClientChannel {
        ClientChannel::new(id, self)
    }

    pub const fn normal_channel(&self, id: ChannelId) -> ClientNormalChannel {
        ClientNormalChannel::new(self.channel(id))
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkSession(&self.session)
            .set_status(&SetStReq {
                status: client_status as _,
            })
            .await?;

        Ok(())
    }

    pub async fn login<S>(
        stream: S,
        pool: DatabasePool,
        info: ClientConfig<'_>,
        credential: ClientCredential<'_>,
        status: ClientStatus,
    ) -> Result<Self, LoginError>
    where
        S: AsyncRead + AsyncWrite + Unpin,
    {
        let (session, mut stream) = LocoSession::new(LocoClient::new(stream));

        let mut stream_buffer = Vec::new();
        let login_res = {
            let login_task = pin!(async {
                let mut login_res = TalkSession(&session)
                    .login(&LoginListReq {
                        os: info.os,
                        net_type: info.net_type,
                        app_version: info.app_version,
                        mccmnc: info.mccmnc,
                        protocol_version: "1.0",
                        device_uuid: credential.device_uuid,
                        oauth_token: credential.access_token,
                        language: info.language,
                        device_type: Some(info.device_type),
                        pc_status: Some(status as _),
                        revision: None,
                        rp: [0x00, 0x00, 0xff, 0xff, 0x00, 0x00],
                        chat_list: LChatListReq {
                            chat_ids: &[],
                            max_ids: &[],
                            last_token_id: 0,
                            last_chat_id: None,
                        },
                        last_block_token: 0,
                        background: None,
                    })
                    .await?;

                if !login_res.chat_list.eof {
                    let mut stream = pin!(TalkSession(&session).channel_list_stream(0, None));

                    while let Some(mut res) = stream.try_next().await? {
                        login_res.chat_list.chat_datas.append(&mut res.chat_datas);
                    }
                }

                Ok::<_, LoginError>(login_res)
            });

            let stream_task = pin!(async {
                while let Some(next) = stream.next().await {
                    let next = match next {
                        Ok(next) => next,
                        Err(err) => return LoginError::Io(err),
                    };

                    stream_buffer.push(next);
                }

                LoginError::SessionClosed
            });

            select! {
                res = login_task => res?,
                err = stream_task => return Err(err),
            }
        };

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

    #[error("session closed")]
    SessionClosed,
}

#[derive(Debug, Clone, Copy)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

pub type ClientResult<T> = Result<T, ClientError>;
