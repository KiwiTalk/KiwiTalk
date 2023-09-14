pub mod error;

use bson::Document;
use futures::{pin_mut, Sink, SinkExt, StreamExt, Stream};
use serde::de::DeserializeOwned;
use talk_loco_client::session::ReadResult;
use talk_loco_command::{command::BsonCommand, response::chat};

use crate::{
    chat::Chatlog,
    event::{
        channel::{ChannelEvent, ChatRead, ChatReceived},
        KiwiTalkClientEvent,
    },
};

use self::error::ClientHandlerError;

#[derive(Debug)]
pub(crate) struct HandlerTask<Listener> {
    emitter: HandlerEmitter<Listener>,
}

impl<Listener: Sink<KiwiTalkClientEvent> + Unpin + 'static> HandlerTask<Listener> {
    pub const fn new(listener: Listener) -> Self {
        Self {
            emitter: HandlerEmitter(listener),
        }
    }

    pub async fn run(mut self, stream: impl Stream<Item = ReadResult>) {
        pin_mut!(stream);
        while let Some(read) = stream.next().await {
            match read {
                Ok(read) => {
                    if let Err(err) = self.handle_inner(read.command).await {
                        self.emitter.emit(KiwiTalkClientEvent::Error(err)).await;
                    }
                }

                Err(err) => {
                    self.emitter
                        .emit(KiwiTalkClientEvent::Error(err.into()))
                        .await;
                }
            }
        }
    }

    // TODO:: Use macro
    async fn handle_inner(&mut self, command: BsonCommand<Document>) -> HandlerResult<()> {
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
                self.emitter
                    .emit(KiwiTalkClientEvent::Unhandled(command.into()))
                    .await;
                Ok(())
            }
        }
    }

    async fn on_chat(&mut self, data: chat::Msg) -> HandlerResult<()> {
        let chat = Chatlog::from(data.chatlog);

        self.emitter
            .emit(
                ChannelEvent::Chat(ChatReceived {
                    channel_id: data.chat_id,
                    link_id: data.link_id,
                    log_id: data.log_id,
                    user_nickname: data.author_nickname,
                    chat,
                })
                .into(),
            )
            .await;

        Ok(())
    }

    async fn on_chat_read(&mut self, data: chat::DecunRead) -> HandlerResult<()> {
        self.emitter
            .emit(
                ChannelEvent::ChatRead(ChatRead {
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
        self.emitter
            .emit(KiwiTalkClientEvent::Kickout(data.reason))
            .await;
    }

    async fn on_change_server(&mut self) {
        self.emitter.emit(KiwiTalkClientEvent::SwitchServer).await;
    }
}

#[derive(Debug, Clone)]
struct HandlerEmitter<S>(S);

impl<S: Sink<KiwiTalkClientEvent> + Unpin> HandlerEmitter<S> {
    pub async fn emit(&mut self, event: KiwiTalkClientEvent) {
        self.0.send(event).await.ok();
    }
}

pub type HandlerResult<T> = Result<T, ClientHandlerError>;

fn map_data<T: DeserializeOwned>(method: &str, doc: Document) -> Result<T, ClientHandlerError> {
    bson::de::from_document(doc)
        .map_err(|err| ClientHandlerError::CommandDecode(method.to_string(), err))
}
