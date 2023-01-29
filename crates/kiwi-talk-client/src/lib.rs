pub mod channel;
pub mod chat;
pub mod config;
pub mod database;
pub mod error;
pub mod event;
pub mod handler;
mod initializer;
pub mod status;

use channel::{user::UserId, ChannelDataVariant};
use config::KiwiTalkClientInfo;
use database::pool::DatabasePool;
use error::KiwiTalkClientError;
use event::KiwiTalkClientEvent;
use futures::{pin_mut, AsyncRead, AsyncWrite, Sink, TryStreamExt};
use handler::HandlerTask;
use initializer::load_channel_data;
use status::ClientStatus;
use talk_loco_client::{client::talk::TalkClient, LocoRequestSession};
use talk_loco_command::request::chat::{LChatListReq, LoginListReq, SetStReq};
use tokio::task::JoinHandle;

#[derive(Debug)]
pub struct KiwiTalkClient {
    connection: ClientConnection,

    handler_task: JoinHandle<()>,
}

impl KiwiTalkClient {
    #[inline(always)]
    pub const fn connection(&self) -> &ClientConnection {
        &self.connection
    }

    pub async fn set_status(&self, client_status: ClientStatus) -> ClientResult<()> {
        TalkClient(&self.connection.session)
            .set_status(&SetStReq {
                status: client_status as _,
            })
            .await?;

        Ok(())
    }

    pub async fn load_channel_list(&self) -> ClientResult<Vec<ChannelDataVariant>> {
        let mut channel_list_data = Vec::new();

        {
            let client = TalkClient(&self.connection.session);
            let stream = client.channel_list_stream(0, None);
            pin_mut!(stream);

            while let Some(res) = stream.try_next().await? {
                channel_list_data.extend(res.chat_datas);
            }
        }

        load_channel_data(&self.connection, channel_list_data).await
    }
}

impl Drop for KiwiTalkClient {
    fn drop(&mut self) {
        self.handler_task.abort();
    }
}

#[derive(Debug)]
#[non_exhaustive]
pub struct ClientConnection {
    pub user_id: UserId,
    pub session: LocoRequestSession,
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
    Listener: Sink<KiwiTalkClientEvent> + Send + Clone + Unpin + 'static,
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
    ) -> ClientResult<(KiwiTalkClient, Vec<ChannelDataVariant>)> {
        let (session, broadcast_stream) = LocoRequestSession::new(self.stream);

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

        let mut channel_list_data = login_res.chat_list.chat_datas;

        if !login_res.chat_list.eof {
            let talk_client = TalkClient(&session);
            let stream = talk_client.channel_list_stream(
                login_res.chat_list.last_token_id.unwrap_or_default(),
                login_res.chat_list.last_chat_id,
            );

            pin_mut!(stream);
            while let Some(res) = stream.try_next().await? {
                channel_list_data.extend(res.chat_datas);
            }
        }

        let connection = ClientConnection {
            user_id: login_res.user_id,
            session,
            pool: self.pool,
        };

        let channel_data = load_channel_data(&connection, channel_list_data).await?;

        let handler_task = tokio::spawn(HandlerTask::new(self.listener).run(broadcast_stream));

        let client = KiwiTalkClient {
            connection,
            handler_task,
        };

        Ok((client, channel_data))
    }
}

#[derive(Debug)]
pub struct ClientCredential<'a> {
    pub access_token: &'a str,
    pub device_uuid: &'a str,
    pub user_id: Option<i64>,
}

pub type ClientResult<T> = Result<T, KiwiTalkClientError>;
