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
use database::{spawn_database_task, KiwiTalkDatabaseError, KiwiTalkDatabasePool};
use error::KiwiTalkClientError;
use event::KiwiTalkClientEvent;
use futures::{pin_mut, AsyncRead, AsyncWrite, Future, StreamExt};
use handler::KiwiTalkClientHandler;
use kiwi_talk_db::{
    channel::model::{ChannelId, ChannelModel},
    chat::model::ChatModel,
    model::FullModel,
};
use status::ClientStatus;
use talk_loco_client::{client::talk::TalkClient, LocoCommandSession};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq, SetStReq};
use tokio::sync::mpsc::channel;

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
        spawn_database_task(pool.clone(), |mut connection| {
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
        let talk_client = TalkClient(&self.session);

        let (sender, mut recv) = channel(4);

        let login_res = talk_client
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

        sender.send(login_res.chat_list.chat_datas).await.unwrap();

        tokio::spawn(spawn_database_task(self.pool.clone(), move |connection| {
            while let Some(datas) = recv.blocking_recv() {
                for data in datas {
                    println!("{:?}", data);
                    connection.channel().insert(&FullModel::new(
                        data.id,
                        ChannelModel {
                            channel_type: data.channel_type,
                            active_user_count: data.active_member_count,
                            new_chat_count: data.unread_count,
                            last_chat_log_id: data.last_log_id,
                            last_seen_log_id: data.last_seen_log_id,
                            push_alert: data.push_alert,
                        },
                    ))?;

                    if let Some(chatlog) = data.chatlog {
                        connection.chat().insert(&FullModel::new(
                            chatlog.log_id,
                            ChatModel {
                                channel_id: chatlog.chat_id,
                                prev_log_id: chatlog.prev_log_id,
                                chat_type: chatlog.chat_type,
                                message_id: chatlog.msg_id,
                                send_at: chatlog.send_at,
                                author_id: chatlog.author_id,
                                message: chatlog.message,
                                attachment: chatlog.attachment,
                                supplement: chatlog.supplement,
                                referer: chatlog.referer,
                                deleted: false,
                            },
                        ))?;
                    }
                }
            }

            Ok(())
        }));

        if !login_res.chat_list.eof {
            let stream = talk_client.channel_list_stream(
                login_res.chat_list.last_token_id.unwrap_or_default(),
                login_res.chat_list.last_chat_id,
            );
            pin_mut!(stream);
            while let Some(res) = stream.next().await {
                let res = res?;
                sender.send(res.chat_datas).await.unwrap();
            }
        }

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

    #[inline(always)]
    pub const fn channel<'a>(&'a self, channel_id: ChannelId) -> KiwiTalkClientChannel<'a> {
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
