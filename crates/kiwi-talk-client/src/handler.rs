use std::sync::Arc;

use bson::Document;
use futures::Future;
use serde::de::DeserializeOwned;
use talk_loco_client::ReadResult;
use talk_loco_command::{command::BsonCommand, response::chat};

use crate::event::{KiwiTalkClientError, KiwiTalkClientEvent};

#[derive(Debug)]
pub struct KiwiTalkClientHandler<Listener> {
    listener: Listener,
}

impl<Fut, Listener> KiwiTalkClientHandler<Listener>
where
    Fut: Future<Output = ()>,
    Listener: Fn(KiwiTalkClientEvent) -> Fut,
{
    pub const fn new(listener: Listener) -> Self {
        Self { listener }
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
                self.emit(KiwiTalkClientEvent::Error(err.into()))
                    .await;
            }
        }
    }

    // TODO:: Use macro
    async fn handle_command(&self, command: BsonCommand<Document>) -> HandlerResult<()> {
        match command.method.as_ref() {
            "MSG" => Ok(self.on_chat(map_data("MSG", command.data)?).await),
            "CHANGESVR" => Ok(self.on_change_server().await),
            "KICKOUT" => Ok(self.on_kickout(map_data("KICKOUT", command.data)?).await),

            _ => Ok(self
                .emit(KiwiTalkClientEvent::Unhandled(command.into()))
                .await),
        }
    }

    async fn on_chat(&self, data: chat::Msg) {
        self.emit(KiwiTalkClientEvent::Chat {
            channel_id: data.chat_id,
            link_id: data.link_id,

            log_id: data.log_id,
            author_nickname: data.author_nickname,
            chat: data.chatlog,
        })
        .await;
    }

    async fn on_kickout(&self, data: chat::Kickout) {
        self.emit(KiwiTalkClientEvent::Kickout {
            reason: data.reason,
        })
        .await;
    }

    async fn on_change_server(&self) {
        self.emit(KiwiTalkClientEvent::SwitchServer).await;
    }
}

pub type HandlerResult<T> = Result<T, KiwiTalkClientError>;

fn map_data<T: DeserializeOwned>(method: &str, doc: Document) -> Result<T, KiwiTalkClientError> {
    bson::de::from_document(doc).map_err(|_| KiwiTalkClientError::CommandDecode(method.to_string()))
}
