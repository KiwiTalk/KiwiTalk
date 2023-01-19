pub mod channel;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;
pub mod status;

use std::sync::Arc;

use channel::KiwiTalkClientChannel;
use config::KiwiTalkClientConfig;
use database::{run_database_task, KiwiTalkDatabaseError, KiwiTalkDatabasePool};
use error::KiwiTalkClientError;
use event::KiwiTalkClientEvent;
use futures::{AsyncRead, AsyncWrite, Future};
use handler::KiwiTalkClientHandler;
use kiwi_talk_db::channel::model::ChannelId;
use status::ClientStatus;
use talk_loco_client::{client::talk::TalkClient, LocoCommandSession};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq, SetStReq};

#[derive(Debug)]
pub struct KiwiTalkClient {
    pub config: KiwiTalkClientConfig,

    session: LocoCommandSession,

    pool: KiwiTalkDatabasePool,
}

impl KiwiTalkClient {
    pub async fn new<
        S: AsyncRead + AsyncWrite + Send + 'static,
        Fut: Future<Output = ()> + Send + 'static,
    >(
        stream: S,
        config: KiwiTalkClientConfig,
        pool: KiwiTalkDatabasePool,
        listener: impl Send + Sync + 'static + Fn(KiwiTalkClientEvent) -> Fut,
    ) -> Result<Self, KiwiTalkDatabaseError> {
        run_database_task(pool.clone(), |mut connection| {
            Ok(connection.migrate_to_latest()?)
        })
        .await?;

        let handler = Arc::new(KiwiTalkClientHandler::new(pool.clone(), listener));

        let session = LocoCommandSession::new(stream, move |read| {
            tokio::spawn(Arc::clone(&handler).handle(read));
        });

        Ok(KiwiTalkClient {
            config,
            session,
            pool,
        })
    }

    pub async fn login(
        &self,
        credential: ClientCredential<'_>,
        client_status: ClientStatus,
    ) -> ClientResult<()> {
        let login_res = TalkClient(&self.session)
            .login(&LoginListReq {
                client: self.config.client.clone(),
                protocol_version: "1.0".into(),
                device_uuid: credential.device_uuid.into(),
                oauth_token: credential.access_token.into(),
                language: self.config.language.clone(),
                device_type: Some(self.config.device_type),
                pc_status: Some(client_status as _),
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

        Ok(())
    }

    #[inline(always)]
    pub const fn session(&self) -> &LocoCommandSession {
        &self.session
    }

    #[inline(always)]
    pub const fn pool(&self) -> &KiwiTalkDatabasePool {
        &self.pool
    }

    pub fn channel<'a>(&'a self, channel_id: ChannelId) -> KiwiTalkClientChannel<'a> {
        KiwiTalkClientChannel::new(self, channel_id)
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkClient(&self.session)
            .set_status(&SetStReq {
                status: client_status as _,
            })
            .await?;

        Ok(())
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

pub type ClientResult<T> = Result<T, KiwiTalkClientError>;
