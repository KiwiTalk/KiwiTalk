pub mod error;

use std::sync::Arc;

use bson::Document;
use futures::Future;
use serde::de::DeserializeOwned;
use talk_loco_client::{LocoCommandSession, ReadResult};
use talk_loco_command::{
    command::BsonCommand,
    response::{chat, ResponseData},
};

use crate::{
    database::{conversion::chat_model_from_chatlog, KiwiTalkDatabasePool},
    event::{
        channel::{ChatRead, KiwiTalkChannelEvent, ReceivedChat},
        KiwiTalkClientEvent,
    },
};

use self::error::KiwiTalkClientHandlerError;

#[derive(Debug)]
pub struct KiwiTalkClientHandler<Listener> {
    pool: KiwiTalkDatabasePool,
    listener: Listener,
}

impl<Fut, Listener> KiwiTalkClientHandler<Listener>
where
    Fut: Future<Output = ()>,
    Listener: Fn(KiwiTalkClientEvent) -> Fut,
{
    pub const fn new(pool: KiwiTalkDatabasePool, listener: Listener) -> Self {
        Self { pool, listener }
    }

    pub fn emit(&self, event: KiwiTalkClientEvent) -> Fut {
        (self.listener)(event)
    }

    pub async fn handle(self: Arc<Self>, read: ReadResult) {
        match read {
            Ok(read) => {
                if let Err(err) = self.handle_command(read.command).await {
                    self.emit(KiwiTalkClientEvent::Error(err)).await;
                }
            }

            Err(err) => {
                self.emit(KiwiTalkClientEvent::Error(err.into())).await;
            }
        }
    }

    // TODO:: Use macro
    async fn handle_command(&self, command: BsonCommand<ResponseData>) -> HandlerResult<()> {
        match command.method.as_ref() {
            "MSG" => Ok(self.on_chat(map_data("MSG", command.data.data)?).await?),
            "DECUNREAD" => Ok(self
                .on_chat_read(map_data("DECUNREAD", command.data.data)?)
                .await?),

            "CHANGESVR" => {
                self.on_change_server().await;
                Ok(())
            }

            "KICKOUT" => {
                self.on_kickout(map_data("KICKOUT", command.data.data)?)
                    .await;
                Ok(())
            }

            _ => {
                self.emit(KiwiTalkClientEvent::Unhandled(command.into()))
                    .await;
                Ok(())
            }
        }
    }

    async fn on_chat(&self, data: chat::Msg) -> HandlerResult<()> {
        let chatlog = data.chatlog.clone();
        self.pool
            .spawn_task(move |connection| {
                connection
                    .chat()
                    .insert(&chat_model_from_chatlog(&chatlog))?;
                Ok(())
            })
            .await?;

        self.emit(
            KiwiTalkChannelEvent::Chat(ReceivedChat {
                channel_id: data.chat_id,
                link_id: data.link_id,
                log_id: data.log_id,
                user_nickname: data.author_nickname,
                chat: data.chatlog,
            })
            .into(),
        )
        .await;

        Ok(())
    }

    async fn on_chat_read(&self, data: chat::DecunRead) -> HandlerResult<()> {
        self.pool
            .spawn_task(move |connection| {
                connection
                    .user()
                    .update_watermark(data.user_id, data.chat_id, data.watermark)?;
                Ok(())
            })
            .await?;

        self.emit(
            KiwiTalkChannelEvent::ChatRead(ChatRead {
                channel_id: data.chat_id,
                user_id: data.user_id,
                log_id: data.watermark,
            })
            .into(),
        )
        .await;

        Ok(())
    }

    async fn on_kickout(&self, data: chat::Kickout) {
        self.emit(KiwiTalkClientEvent::Kickout(data.reason)).await;
    }

    async fn on_change_server(&self) {
        self.emit(KiwiTalkClientEvent::SwitchServer).await;
    }
}

pub type HandlerResult<T> = Result<T, KiwiTalkClientHandlerError>;

fn map_data<T: DeserializeOwned>(
    method: &str,
    doc: Document,
) -> Result<T, KiwiTalkClientHandlerError> {
    bson::de::from_document(doc)
        .map_err(|err| KiwiTalkClientHandlerError::CommandDecode(method.to_string(), err))
}
