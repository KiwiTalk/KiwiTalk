pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;
mod initializer;
pub mod status;
pub mod user;

use std::{ops::Deref, sync::Arc};

use channel::{
    normal::{ClientNormalChannelList, NormalChannelDataList},
    ClientChannelList,
};
use config::KiwiTalkClientInfo;
use database::DatabasePool;
use error::KiwiTalkClientError;
use event::KiwiTalkClientEvent;
use futures::{AsyncRead, AsyncWrite, Sink};
use handler::HandlerTask;
use initializer::initialize_client;
use kiwi_talk_db::channel::model::ChannelUserId;
use status::ClientStatus;
use talk_loco_client::{client::talk::TalkClient, LocoCommandSession};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq, SetStReq};
use tokio::task::JoinHandle;

#[derive(Debug)]
pub struct KiwiTalkClient {
    inner: Arc<ClientShared>,
    handler_task: JoinHandle<()>,
}

impl Deref for KiwiTalkClient {
    type Target = ClientShared;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl Drop for KiwiTalkClient {
    fn drop(&mut self) {
        self.handler_task.abort();
    }
}

#[derive(Debug)]
pub struct ClientShared {
    connection: ClientConnection,

    normal_channel_list: NormalChannelDataList,
}

impl ClientShared {
    #[inline(always)]
    pub const fn connection(&self) -> &ClientConnection {
        &self.connection
    }

    #[inline(always)]
    pub const fn normal_channel_list(&self) -> ClientNormalChannelList<'_> {
        ClientChannelList::new(&self.connection, &self.normal_channel_list)
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkClient(&self.connection.session)
            .set_status(&SetStReq {
                status: client_status as _,
            })
            .await?;

        Ok(())
    }
}

#[derive(Debug)]
#[non_exhaustive]
pub struct ClientConnection {
    pub user_id: ChannelUserId,
    pub session: LocoCommandSession,
    pub pool: DatabasePool,
}

#[derive(Debug)]
pub struct KiwiTalkClientBuilder<Stream, Listener> {
    stream: Stream,
    pool: DatabasePool,

    pub status: ClientStatus,

    listener: Listener,
}

impl<Stream, Listener> KiwiTalkClientBuilder<Stream, Listener>
where
    Stream: AsyncRead + AsyncWrite + Send + 'static,
    Listener: Sink<KiwiTalkClientEvent> + Unpin + Send + Sync + Clone + 'static,
{
    pub fn new(stream: Stream, pool: DatabasePool, listener: Listener) -> Self {
        Self {
            stream,
            pool,

            status: ClientStatus::Unlocked,

            listener,
        }
    }

    pub fn status(mut self, status: ClientStatus) -> Self {
        self.status = status;

        self
    }

    pub async fn login(
        self,
        info: KiwiTalkClientInfo<'_>,
        credential: ClientCredential<'_>,
    ) -> ClientResult<KiwiTalkClient> {
        let (session_sink, session_recv) = futures::channel::mpsc::channel(128);
        let session = LocoCommandSession::new_with_sink(self.stream, session_sink);

        let login_res = TalkClient(&session)
            .login(&LoginListReq {
                client: info.create_client_info(),
                protocol_version: "1.0".into(),
                device_uuid: credential.device_uuid.into(),
                oauth_token: credential.access_token.into(),
                language: info.language.to_string(),
                device_type: Some(info.device_type),
                pc_status: Some(self.status as _),
                revision: None,
                rp: vec![0x00, 0x00, 0xff, 0xff, 0x00, 0x00],
                chat_list: LChatListReq {
                    chat_ids: vec![],
                    max_ids: vec![],
                    last_token_id: 0,
                    last_chat_id: None,
                },
                last_block_token: 0,
                background: None,
            })
            .await?;

        let client_shared = Arc::new(
            initialize_client(
                ClientConnection {
                    user_id: login_res.user_id,
                    session,
                    pool: self.pool,
                },
                login_res,
            )
            .await?,
        );

        let handler_task =
            tokio::spawn(HandlerTask::new(client_shared.clone()).run(session_recv, self.listener));

        Ok(KiwiTalkClient {
            inner: client_shared,
            handler_task,
        })
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

pub type ClientResult<T> = Result<T, KiwiTalkClientError>;
