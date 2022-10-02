pub mod config;
pub mod event;
pub mod handler;
pub mod status;

use config::KiwiTalkClientConfig;
use event::KiwiTalkClientEvent;
use futures::{AsyncRead, AsyncWrite};
use handler::KiwiTalkClientHandler;
use status::ClientStatus;
use talk_loco_client::{client::talk::TalkClient, LocoCommandSession};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq};
use thiserror::Error;
use tokio::sync::mpsc;

#[derive(Debug)]
pub struct KiwiTalkClient {
    // TODO:: Remove underscore
    _config: KiwiTalkClientConfig,

    // TODO:: Remove underscore
    _session: LocoCommandSession,
    // database
}

impl KiwiTalkClient {
    pub async fn login<S: AsyncRead + AsyncWrite + Send + Unpin + 'static>(
        stream: S,
        config: KiwiTalkClientConfig,
        credential: ClientCredential<'_>,
        client_status: ClientStatus,
    ) -> Result<(Self, KiwiTalkClientEventReceiver), ClientLoginError> {
        let (session, receiver) = LocoCommandSession::new(stream);
        let (event_sender, event_receiver) = mpsc::channel(128);

        tokio::spawn(KiwiTalkClientHandler::run(receiver, event_sender));

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
            .await
            .await
            .or(Err(ClientLoginError::Stream))?;

        // TODO:: Do channel initialization
        let _ = match login_res.data {
            Some(data) => data,
            None => return Err(ClientLoginError::Login(login_res.status)),
        };

        let client = KiwiTalkClient {
            _config: config,
            _session: session,
        };

        Ok((client, KiwiTalkClientEventReceiver(event_receiver)))
    }
}

#[derive(Debug)]
pub struct KiwiTalkClientEventReceiver(mpsc::Receiver<KiwiTalkClientEvent>);

impl KiwiTalkClientEventReceiver {
    #[inline]
    pub async fn recv(&mut self) -> Option<KiwiTalkClientEvent> {
        self.0.recv().await
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

#[derive(Debug, Error)]
pub enum ClientLoginError {
    #[error("Stream error")]
    Stream,

    #[error("LOGINLIST failed. status: {0}")]
    Login(i16),
}
