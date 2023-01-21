pub mod error;

use bson::Document;
use futures::{Sink, SinkExt};
use serde::de::DeserializeOwned;
use talk_loco_client::ReadResult;
use talk_loco_command::{command::BsonCommand, response::chat};

use crate::{
    database::{conversion::chat_model_from_chatlog, KiwiTalkDatabasePool},
    event::{
        channel::{ChatRead, KiwiTalkChannelEvent, ReceivedChat},
        KiwiTalkClientEvent,
    },
};

use self::error::KiwiTalkClientHandlerError;

#[derive(Debug)]
pub struct KiwiTalkClientHandler<S> {
    pool: KiwiTalkDatabasePool,
    sink: S,
}

impl<S: Sink<KiwiTalkClientEvent> + Unpin> KiwiTalkClientHandler<S> {
    pub const fn new(pool: KiwiTalkDatabasePool, sink: S) -> Self {
        Self { pool, sink }
    }

    pub async fn emit(&mut self, event: KiwiTalkClientEvent) {
        self.sink.send(event).await.ok();
    }

    pub async fn handle(&mut self, read: ReadResult) {
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
    async fn handle_command(&mut self, command: BsonCommand<Document>) -> HandlerResult<()> {
        match command.method.as_ref() {
            "MSG" => Ok(self.on_chat(map_data("MSG", command.data)?).await?),
            "DECUNREAD" => Ok(self
                .on_chat_read(map_data("DECUNREAD", command.data)?)
                .await?),

            "CHANGESVR" => {
                self.on_change_server().await;
                Ok(())
            }

            "KICKOUT" => {
                self.on_kickout(map_data("KICKOUT", command.data)?).await;
                Ok(())
            }

            _ => {
                self.emit(KiwiTalkClientEvent::Unhandled(command.into()))
                    .await;
                Ok(())
            }
        }
    }

    async fn on_chat(&mut self, data: chat::Msg) -> HandlerResult<()> {
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

    async fn on_chat_read(&mut self, data: chat::DecunRead) -> HandlerResult<()> {
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

    async fn on_kickout(&mut self, data: chat::Kickout) {
        self.emit(KiwiTalkClientEvent::Kickout(data.reason)).await;
    }

    async fn on_change_server(&mut self) {
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
