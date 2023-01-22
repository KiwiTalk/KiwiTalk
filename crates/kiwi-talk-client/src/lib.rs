pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;
pub mod status;
pub mod user;

use channel::KiwiTalkClientChannel;
use config::KiwiTalkClientInfo;
use database::{
    conversion::{channel_model_from_channel_list_data, chat_model_from_chatlog},
    KiwiTalkDatabasePool,
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

    user_id: ChannelUserId,

    pool: KiwiTalkDatabasePool,

    handler_task: JoinHandle<()>,
}

impl KiwiTalkClient {
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
        self.user_id
    }

    #[inline(always)]
    pub const fn channel(&self, channel_id: ChannelId) -> KiwiTalkClientChannel<'_> {
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

impl Drop for KiwiTalkClient {
    fn drop(&mut self) {
        self.handler_task.abort();
    }
}

#[derive(Debug)]
pub struct KiwiTalkClientBuilder<Stream, Listener> {
    stream: Stream,
    pool: KiwiTalkDatabasePool,

    listener: Listener,
}

impl<Stream, Listener> KiwiTalkClientBuilder<Stream, Listener>
where
    Stream: AsyncRead + AsyncWrite + Send + 'static,
    Listener: Sink<KiwiTalkClientEvent> + Unpin + Send + 'static,
{
    pub fn new(stream: Stream, pool: KiwiTalkDatabasePool, listener: Listener) -> Self {
        Self {
            stream,
            pool,

            listener,
        }
    }

    pub async fn login(
        self,
        info: KiwiTalkClientInfo<'_>,
        credential: ClientCredential<'_>,
        client_status: ClientStatus,
    ) -> ClientResult<KiwiTalkClient> {
        let (session_sink, mut session_recv) = futures::channel::mpsc::channel(128);
        let session = LocoCommandSession::new_with_sink(self.stream, session_sink);

        let login_res = TalkClient(&session)
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

        let handler_task = {
            let mut handler =
                KiwiTalkClientHandler::new(self.pool.clone(), login_res.user_id, self.listener);

            tokio::spawn(async move {
                while let Some(read) = session_recv.next().await {
                    handler.handle(read).await;
                }
            })
        };

        let client = KiwiTalkClient {
            session,
            user_id: login_res.user_id,
            pool: self.pool,
            handler_task,
        };

        let talk_client = TalkClient(client.session());

        let (sender, mut recv) = channel(4);
        for data in &login_res.chat_list.chat_datas {
            client.channel(data.id).sync_chats(data.last_log_id).await?;
        }

        let database_task = client.pool().spawn_task(move |connection| {
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
                    client.channel(data.id).sync_chats(data.last_log_id).await?;
                }
                if sender.send(res.chat_datas).await.is_err() {
                    break;
                }
            }
        }

        drop(sender);
        database_task.await?;

        Ok(client)
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

pub type ClientResult<T> = Result<T, KiwiTalkClientError>;
