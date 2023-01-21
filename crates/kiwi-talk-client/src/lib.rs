pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;
pub mod status;
pub mod user;

use std::sync::atomic::{AtomicI64, Ordering};

use channel::KiwiTalkClientChannel;
use config::KiwiTalkClientInfo;
use database::{
    conversion::{channel_model_from_channel_list_data, chat_model_from_chatlog},
    KiwiTalkDatabaseError, KiwiTalkDatabasePool,
};
use error::KiwiTalkClientError;
use event::KiwiTalkClientEvent;
use futures::{pin_mut, AsyncRead, AsyncWrite, Sink, StreamExt};
use handler::KiwiTalkClientHandler;
use kiwi_talk_db::channel::model::{ChannelId, ChannelUserId};
use status::ClientStatus;
use talk_loco_client::{client::talk::TalkClient, LocoCommandSession};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq, SetStReq};
use tokio::{sync::mpsc::channel, task::JoinHandle};

#[derive(Debug)]
pub struct KiwiTalkClient {
    session: LocoCommandSession,

    user_id: AtomicI64,

    pool: KiwiTalkDatabasePool,

    handler_task: JoinHandle<()>,
}

impl KiwiTalkClient {
    pub async fn new<S: AsyncRead + AsyncWrite + Send + 'static>(
        stream: S,
        pool: KiwiTalkDatabasePool,
        sink: impl Sink<KiwiTalkClientEvent> + Unpin + Send + 'static,
    ) -> Result<Self, KiwiTalkDatabaseError> {
        pool.spawn_task(|mut connection| Ok(connection.migrate_to_latest()?))
            .await?;

        let (sender, mut recv) = futures::channel::mpsc::channel(128);
        let session = LocoCommandSession::new_with_sink(stream, sender);

        let mut handler = KiwiTalkClientHandler::new(pool.clone(), sink);
        let handler_task = tokio::spawn(async move {
            while let Some(read) = recv.next().await {
                handler.handle(read).await;
            }
        });

        Ok(KiwiTalkClient {
            session,
            user_id: AtomicI64::new(0),
            pool,
            handler_task,
        })
    }

    #[inline(always)]
    pub const fn session(&self) -> &LocoCommandSession {
        &self.session
    }

    #[inline(always)]
    pub const fn pool(&self) -> &KiwiTalkDatabasePool {
        &self.pool
    }

    #[inline(always)]
    pub fn user_id(&self) -> ChannelUserId {
        self.user_id.load(Ordering::Acquire)
    }

    #[inline(always)]
    pub const fn channel(&self, channel_id: ChannelId) -> KiwiTalkClientChannel<'_> {
        KiwiTalkClientChannel::new(self, channel_id)
    }

    pub async fn login(
        &self,
        info: KiwiTalkClientInfo<'_>,
        credential: ClientCredential<'_>,
        client_status: ClientStatus,
    ) -> ClientResult<()> {
        let talk_client = TalkClient(&self.session);

        let (sender, mut recv) = channel(4);

        let login_res = talk_client
            .login(&LoginListReq {
                client: info.create_client_info(),
                protocol_version: "1.0".into(),
                device_uuid: credential.device_uuid.into(),
                oauth_token: credential.access_token.into(),
                language: info.language.to_string(),
                device_type: Some(info.device_type),
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

        self.user_id.store(login_res.user_id, Ordering::Release);

        for data in &login_res.chat_list.chat_datas {
            self.channel(data.id).sync_chats(data.last_log_id).await?;
        }

        let database_task = self.pool.spawn_task(move |connection| {
            while let Some(datas) = recv.blocking_recv() {
                for data in datas {
                    connection
                        .channel()
                        .insert(&channel_model_from_channel_list_data(&data))?;

                    if let Some(ref chatlog) = data.chatlog {
                        connection
                            .chat()
                            .insert(&chat_model_from_chatlog(chatlog))?;
                    }
                }
            }

            Ok(())
        });

        sender.send(login_res.chat_list.chat_datas).await.unwrap();

        if !login_res.chat_list.eof {
            let stream = talk_client.channel_list_stream(
                login_res.chat_list.last_token_id.unwrap_or_default(),
                login_res.chat_list.last_chat_id,
            );
            pin_mut!(stream);
            while let Some(res) = stream.next().await {
                let res = res?;

                for data in &res.chat_datas {
                    self.channel(data.id).sync_chats(data.last_log_id).await?;
                }
                if sender.send(res.chat_datas).await.is_err() {
                    break;
                }
            }
        }

        drop(sender);
        database_task.await?;

        Ok(())
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

impl Drop for KiwiTalkClient {
    fn drop(&mut self) {
        self.handler_task.abort();
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

pub type ClientResult<T> = Result<T, KiwiTalkClientError>;
