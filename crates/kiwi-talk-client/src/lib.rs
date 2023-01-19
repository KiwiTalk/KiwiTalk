pub mod channel;
pub mod config;
pub mod database;
pub mod event;
pub mod handler;
pub mod status;

use std::sync::Arc;

use channel::KiwiTalkClientChannel;
use config::KiwiTalkClientConfig;
use database::{run_database_task, KiwiTalkDatabasePool};
use event::KiwiTalkClientEvent;
use futures::{AsyncRead, AsyncWrite, Future};
use handler::KiwiTalkClientHandler;
use kiwi_talk_db::channel::model::ChannelId;
use status::ClientStatus;
use talk_loco_client::{
    client::{talk::TalkClient, ClientRequestResult},
    LocoCommandSession,
};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq};

#[derive(Debug)]
pub struct KiwiTalkClient {
    pub config: KiwiTalkClientConfig,

    session: LocoCommandSession,

    pool: KiwiTalkDatabasePool,
}

impl KiwiTalkClient {
    // TODO:: Reduce complexity
    pub async fn login<
        S: AsyncRead + AsyncWrite + Send + 'static,
        Fut: Future<Output = ()> + Send + 'static,
    >(
        stream: S,
        config: KiwiTalkClientConfig,
        credential: ClientCredential<'_>,
        client_status: ClientStatus,
        pool: KiwiTalkDatabasePool,
        listener: impl Send + Sync + 'static + Fn(KiwiTalkClientEvent) -> Fut,
    ) -> ClientRequestResult<Self> {
        run_database_task(pool.clone(), |mut connection| {
            Ok(connection.migrate_to_latest()?)
        })
        .await
        .unwrap();

        let handler = Arc::new(KiwiTalkClientHandler::new(pool.clone(), listener));

        let session = LocoCommandSession::new(stream, move |read| {
            tokio::spawn(Arc::clone(&handler).handle(read));
        });

        let login_res = TalkClient(&session)
            .login(&LoginListReq {
                client: config.client.clone(),
                protocol_version: "1.0".into(),
                device_uuid: credential.device_uuid.into(),
                oauth_token: credential.access_token.into(),
                language: config.language.clone(),
                device_type: Some(config.device_type),
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

        let client = KiwiTalkClient {
            config,
            session,
            pool,
        };

        Ok(client)
    }

    #[inline(always)]
    pub const fn session(&self) -> &LocoCommandSession {
        &self.session
    }

    pub fn channel<'a>(&'a self, channel_id: ChannelId) -> KiwiTalkClientChannel<'a> {
        KiwiTalkClientChannel::new(self, channel_id)
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}
