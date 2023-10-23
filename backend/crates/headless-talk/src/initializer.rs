use std::{io, pin::pin, sync::Arc};

use futures::{AsyncRead, AsyncWrite, Future, TryStreamExt};
use futures_loco_protocol::{
    loco_protocol::command::BoxedCommand,
    session::{LocoSession, LocoSessionStream},
    LocoClient,
};
use talk_loco_client::{
    talk::session::{
        load_channel_list::{self, ChannelListData},
        login, TalkSession,
    },
    RequestError,
};
use thiserror::Error;
use tokio::time;

use crate::{
    config::ClientEnv,
    constants::PING_INTERVAL,
    database::{DatabasePool, MigrationError, PoolTaskError},
    event::ClientEvent,
    handler::{error::HandlerError, SessionHandler},
    ClientStatus, HeadlessTalk,
};

pub struct TalkInitializer<S> {
    session: LocoSession,
    stream: LocoSessionStream<S>,

    user_id: i64,
    channel_list: Vec<Vec<ChannelListData>>,

    buffer: Vec<BoxedCommand>,
}

impl<S: AsyncRead + AsyncWrite + Unpin> TalkInitializer<S> {
    pub async fn login(
        client: LocoClient<S>,
        env: ClientEnv<'_>,
        credential: Credential<'_>,
        status: ClientStatus,
    ) -> Result<Self, LoginError> {
        let (session, mut stream) = LocoSession::new(client);

        let mut stream_buffer = Vec::new();
        let mut channel_list = Vec::new();

        let login_task = async {
            let (res, stream) = TalkSession(&session)
                .login(login::Request {
                    os: env.os,
                    net_type: env.net_type as _,
                    app_version: env.app_version,
                    mccmnc: env.mccmnc,
                    protocol_version: "1.0",
                    device_uuid: credential.device_uuid,
                    oauth_token: credential.access_token,
                    language: env.language,
                    device_type: Some(2),
                    pc_status: Some(status as _),
                    revision: None,
                    rp: [0x00, 0x00, 0xff, 0xff, 0x00, 0x00],
                    chat_list: load_channel_list::Request {
                        chat_ids: &[],
                        max_ids: &[],
                        last_token_id: 0,
                        last_chat_id: None,
                    },
                    last_block_token: 0,
                    background: None,
                })
                .await?;

            if let Some(stream) = stream {
                let mut stream = pin!(stream);

                while let Some(res) = stream.try_next().await? {
                    channel_list.push(res.chat_datas);
                }
            }

            Ok::<_, RequestError>(res.user_id)
        };

        let stream_task = async {
            while let Some(read) = stream.try_next().await? {
                stream_buffer.push(read);
            }

            Ok::<_, io::Error>(())
        };

        let user_id = tokio::select! {
            res = login_task => res?,
            res = stream_task => {
                res?;
                unreachable!();
            },
        };

        Ok(Self {
            session,
            stream,

            user_id,
            channel_list,
            buffer: stream_buffer,
        })
    }

    pub const fn user_id(&self) -> i64 {
        self.user_id
    }

    pub async fn initialize<F, Fut>(
        self,
        database_url: impl Into<String>,
        command_handler: F,
    ) -> Result<HeadlessTalk, InitializeError>
    where
        S: Send + Sync + 'static,
        F: Fn(Result<ClientEvent, HandlerError>) -> Fut + Send + Sync + 'static,
        Fut: Future + Send + Sync + 'static,
    {
        let pool = DatabasePool::new(database_url).map_err(PoolTaskError::from)?;
        pool.migrate_to_latest().await?;

        let stream_task = tokio::spawn({
            let pool = pool.clone();

            async move {
                let command_handler = Arc::new(command_handler);
                let handler = Arc::new(SessionHandler::new(pool));

                for read in self.buffer {
                    tokio::spawn({
                        let command_handler = command_handler.clone();
                        let handler = handler.clone();

                        async move {
                            match handler.handle(read).await {
                                Ok(Some(event)) => {
                                    command_handler(Ok(event)).await;
                                }

                                Err(err) => {
                                    command_handler(Err(err)).await;
                                }

                                _ => {}
                            }
                        }
                    });
                }

                let res: Result<ClientEvent, HandlerError> = async {
                    let mut stream = pin!(self.stream);
                    while let Some(read) = stream.try_next().await? {
                        tokio::spawn({
                            let command_handler = command_handler.clone();
                            let handler = handler.clone();

                            async move {
                                match handler.handle(read).await {
                                    Ok(Some(event)) => {
                                        command_handler(Ok(event)).await;
                                    }

                                    Err(err) => {
                                        command_handler(Err(err)).await;
                                    }

                                    _ => {}
                                }
                            }
                        });
                    }

                    unreachable!();
                }
                .await;

                command_handler(res);
            }
        });

        let ping_task = tokio::spawn({
            let session = self.session.clone();

            async move {
                let mut interval = time::interval(PING_INTERVAL);

                while TalkSession(&session).ping().await.is_ok() {
                    interval.tick().await;
                }
            }
        });

        Ok(HeadlessTalk {
            user_id: self.user_id,
            session: self.session,
            pool,
            ping_task,
            stream_task,
        })
    }
}

#[derive(Debug, Error)]
#[error(transparent)]
pub enum LoginError {
    Request(#[from] RequestError),
    Io(#[from] io::Error),
}

#[derive(Debug, Error)]
#[error(transparent)]
pub enum InitializeError {
    Migration(#[from] MigrationError),
    Database(#[from] PoolTaskError),
    Request(#[from] RequestError),
}

#[derive(Debug, Clone, Copy)]
pub struct Credential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
}
