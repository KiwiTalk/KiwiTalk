pub mod config;

use std::{io, pin::pin, sync::Arc};

use diesel::{QueryDsl, RunQueryDsl};
use futures::{AsyncRead, AsyncWrite, Future, TryStreamExt};
use futures_loco_protocol::{
    loco_protocol::command::BoxedCommand,
    session::{LocoSession, LocoSessionStream},
    LocoClient,
};
use talk_loco_client::talk::session::{
    load_channel_list::{self},
    login, TalkSession,
};
use thiserror::Error;
use tokio::time;

use crate::{
    conn::Conn,
    constants::PING_INTERVAL,
    database::{schema::channel_list, DatabasePool, MigrationError, PoolTaskError},
    event::ClientEvent,
    handler::{error::HandlerError, SessionHandler},
    task::BackgroundTask,
    updater::list::ChannelListUpdater,
    ClientError, ClientStatus, HeadlessTalk, Inner,
};

use self::config::ClientEnv;

pub struct TalkInitializer<'a, S> {
    session: LocoSession,
    stream: LocoSessionStream<S>,

    pool: DatabasePool,

    env: ClientEnv<'a>,
}

impl<'a, S: AsyncRead + AsyncWrite + Unpin> TalkInitializer<'a, S> {
    pub async fn new(
        client: LocoClient<S>,
        env: ClientEnv<'a>,
        database_url: impl Into<String>,
    ) -> Result<TalkInitializer<'a, S>, InitError> {
        let (session, stream) = LocoSession::new(client);

        let pool = DatabasePool::initialize(database_url).await?;
        pool.migrate_to_latest().await?;

        Ok(Self {
            session,
            stream,

            pool,

            env,
        })
    }

    pub async fn login<F, Fut>(
        mut self,
        credential: Credential<'_>,
        status: ClientStatus,
        command_handler: F,
    ) -> Result<HeadlessTalk, LoginError>
    where
        S: Send + 'static,
        F: Fn(Result<ClientEvent, HandlerError>) -> Fut + Send + Sync + 'static,
        Fut: Future + Send + Sync + 'static,
    {
        let mut channel_list = Vec::new();

        let (chat_ids, max_ids) = self
            .pool
            .spawn(|conn| {
                let iter = channel_list::table
                    .select((channel_list::id, channel_list::last_seen_log_id))
                    .load_iter::<(i64, Option<i64>), _>(conn)?;

                let mut chat_ids = Vec::with_capacity(iter.size_hint().0);
                let mut max_ids = Vec::with_capacity(iter.size_hint().0);

                for res in iter {
                    let (channel_id, max_id) = res?;

                    chat_ids.push(channel_id);
                    max_ids.push(max_id.unwrap_or(0));
                }

                Ok((chat_ids, max_ids))
            })
            .await
            .map_err(ClientError::from)?;

        let mut stream_buffer = Vec::new();

        let (user_id, deleted_channels) =
            run_session(&mut self.stream, &mut stream_buffer, async {
                let (res, stream) = TalkSession(&self.session)
                    .login(login::Request {
                        os: self.env.os,
                        net_type: self.env.net_type as _,
                        app_version: self.env.app_version,
                        mccmnc: self.env.mccmnc,
                        protocol_version: "1.0",
                        device_uuid: credential.device_uuid,
                        oauth_token: credential.access_token,
                        language: self.env.language,
                        device_type: Some(2),
                        pc_status: Some(status as _),
                        revision: None,
                        rp: [0x00, 0x00, 0xff, 0xff, 0x00, 0x00],
                        chat_list: load_channel_list::Request {
                            chat_ids: &chat_ids,
                            max_ids: &max_ids,
                            last_token_id: 0,
                            last_chat_id: None,
                        },
                        last_block_token: 0,
                        background: None,
                    })
                    .await?;

                channel_list.push(res.chat_list.chat_datas);

                if let Some(stream) = stream {
                    let mut stream = pin!(stream);

                    while let Some(res) = stream.try_next().await? {
                        channel_list.push(res.chat_datas);
                    }
                }

                Ok::<_, ClientError>((res.user_id, res.chat_list.deleted_chat_ids))
            })
            .await??;

        let conn = Conn {
            user_id,
            session: self.session.clone(),
            pool: self.pool.clone(),
        };

        let stream_task = BackgroundTask::new(
            tokio::spawn({
                let command_handler = Arc::new(command_handler);
                let handler = Arc::new(SessionHandler::new(conn.clone()));

                async move {
                    for read in stream_buffer {
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
            })
            .abort_handle(),
        );

        let ping_task = BackgroundTask::new(
            tokio::spawn({
                let session = self.session.clone();

                async move {
                    let mut interval = time::interval(PING_INTERVAL);

                    while TalkSession(&session).ping().await.is_ok() {
                        interval.tick().await;
                    }
                }
            })
            .abort_handle(),
        );

        ChannelListUpdater::new(&self.session, &self.pool)
            .update(channel_list.into_iter().flatten(), deleted_channels)
            .await?;

        Ok(HeadlessTalk {
            inner: Arc::new(Inner {
                conn,
                _ping_task: ping_task,
                _stream_task: stream_task,
            }),
        })
    }
}

#[derive(Debug, Error)]
#[error(transparent)]
pub enum LoginError {
    Client(#[from] ClientError),
    Io(#[from] io::Error),
}

#[derive(Debug, Error)]
#[error(transparent)]
pub enum InitError {
    DatabaseInit(#[from] PoolTaskError),
    Migration(#[from] MigrationError),
}

#[derive(Debug, Clone, Copy)]
pub struct Credential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
}

async fn run_session<F: Future>(
    stream: &mut LocoSessionStream<impl AsyncRead + AsyncWrite + Unpin>,
    buffer: &mut Vec<BoxedCommand>,
    task: F,
) -> Result<F::Output, io::Error> {
    let stream_task = async {
        while let Some(read) = stream.try_next().await? {
            buffer.push(read);
        }

        Ok::<_, io::Error>(())
    };

    Ok(tokio::select! {
        res = task => res,
        res = stream_task => {
            res?;
            unreachable!();
        },
    })
}
