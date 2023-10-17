use std::{io, pin::pin};

use futures::{AsyncRead, AsyncWrite, TryStreamExt};
use talk_loco_client::{
    futures_loco_protocol::{
        session::{LocoSession, LocoSessionStream},
        LocoClient,
    },
    loco_protocol::command::BoxedCommand,
    talk::{
        session::{
            load_channel_list::response::ChannelListData, LChatListReq, LoginListReq, TalkSession,
        },
        stream::{StreamCommand, TalkStream},
    },
    RequestError,
};
use thiserror::Error;

use crate::{
    channel::{
        updater::{ChannelUpdater, UpdateError},
        user::UserId,
    },
    config::ClientEnv,
    constants::APP_VERSION,
    database::pool::DatabasePool,
    handler::SessionHandler,
    ClientStatus, HeadlessTalk,
};

pub struct TalkInitializer<S> {
    session: LocoSession,
    stream: LocoSessionStream<S>,

    user_id: UserId,
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
            let chat_ids = &[];
            let max_ids = &[];

            let res = TalkSession(&session)
                .login(&LoginListReq {
                    os: env.os,
                    net_type: env.net_type as _,
                    app_version: APP_VERSION,
                    mccmnc: env.mccmnc,
                    protocol_version: "1.0",
                    device_uuid: credential.device_uuid,
                    oauth_token: credential.access_token,
                    language: env.language,
                    device_type: Some(2),
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

            if !res.chat_list.eof {
                let mut stream = pin!(TalkSession(&session).channel_list_stream(
                    chat_ids,
                    max_ids,
                    res.chat_list.last_token_id.unwrap_or(0),
                    res.chat_list.last_chat_id
                ));

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

    pub const fn user_id(&self) -> UserId {
        self.user_id
    }

    pub async fn initialize(self, pool: DatabasePool) -> Result<HeadlessTalk, InitializeError>
    where
        S: Send + Sync + 'static,
    {
        ChannelUpdater::new(&self.session, &pool)
            .update(self.channel_list.into_iter().flatten())
            .await?;

        let handle = tokio::spawn({
            let pool = pool.clone();

            async move {
                let handler = SessionHandler::new(pool);

                for read in self.buffer {
                    let command = StreamCommand::deserialize_from(read)?;
                }

                let mut stream = TalkStream::new(self.stream);
                while let Some(command) = stream.try_next().await? {}

                Ok::<_, Box<dyn std::error::Error + Send + Sync>>(())
            }
        });

        Ok(HeadlessTalk {
            user_id: self.user_id,
            session: self.session,
            pool,
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
    Request(#[from] RequestError),
    Updater(#[from] UpdateError),
}

#[derive(Debug, Clone, Copy)]
pub struct Credential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
}
