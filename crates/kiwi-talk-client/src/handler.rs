use std::sync::Arc;

use bson::Document;
use futures::Future;
use serde::de::DeserializeOwned;
use talk_loco_client::ReadResult;
use talk_loco_command::{command::BsonCommand, response::{chat, ResponseData}};

use crate::event::{
    channel::{ChatRead, KiwiTalkChannelEvent, ReceivedChat},
    error::KiwiTalkClientError,
    KiwiTalkClientEvent,
};

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
                self.emit(KiwiTalkClientEvent::Error(err.into())).await;
            }
        }
    }

    // TODO:: Use macro
    async fn handle_command(&self, command: BsonCommand<ResponseData>) -> HandlerResult<()> {
        match command.method.as_ref() {
            "MSG" => Ok(self.on_chat(map_data("MSG", command.data.data)?).await),
            "DECUNREAD" => Ok(self
                .on_chat_read(map_data("DECUNREAD", command.data.data)?)
                .await),

            "CHANGESVR" => Ok(self.on_change_server().await),

            "KICKOUT" => Ok(self.on_kickout(map_data("KICKOUT", command.data.data)?).await),

            _ => Ok(self
                .emit(KiwiTalkClientEvent::Unhandled(command.into()))
                .await),
        }
    }

    async fn on_chat(&self, data: chat::Msg) {
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
    }

    async fn on_chat_read(&self, data: chat::DecunRead) {
        self.emit(
            KiwiTalkChannelEvent::ChatRead(ChatRead {
                channel_id: data.chat_id,
                user_id: data.user_id,
                log_id: data.watermark,
            })
            .into(),
        )
        .await;
    }

    async fn on_kickout(&self, data: chat::Kickout) {
        self.emit(KiwiTalkClientEvent::Kickout(data.reason)).await;
    }

    async fn on_change_server(&self) {
        self.emit(KiwiTalkClientEvent::SwitchServer).await;
    }
}

pub type HandlerResult<T> = Result<T, KiwiTalkClientError>;

fn map_data<T: DeserializeOwned>(method: &str, doc: Document) -> Result<T, KiwiTalkClientError> {
    bson::de::from_document(doc).map_err(|_| KiwiTalkClientError::CommandDecode(method.to_string()))
}
