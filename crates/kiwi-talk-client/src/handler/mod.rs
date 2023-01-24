pub mod error;

use std::sync::{Arc, Weak};

use bson::Document;
use futures::{pin_mut, Sink, SinkExt, Stream, StreamExt};
use serde::de::DeserializeOwned;
use talk_loco_client::ReadResult;
use talk_loco_command::{command::BsonCommand, response::chat};

use crate::{
    database::conversion::chat_model_from_chatlog,
    event::{
        channel::{ChannelEvent, ChatRead, ReceivedChat},
        KiwiTalkClientEvent,
    },
    ClientShared,
};

use self::error::ClientHandlerError;

#[derive(Debug)]
pub(crate) struct HandlerTask {
    client: Arc<ClientShared>,
}

impl HandlerTask {
    pub const fn new(client: Arc<ClientShared>) -> Self {
        Self { client }
    }

    pub async fn run(
        self,
        stream: impl Stream<Item = ReadResult>,
        listener: impl Sink<KiwiTalkClientEvent> + Clone + Send + Unpin + 'static,
    ) {
        let mut emitter = HandlerEmitter(listener);

        pin_mut!(stream);
        while let Some(read) = stream.next().await {
            match read {
                Ok(read) => {
                    let mut handler = Handler {
                        client: self.client.clone(),
                        emitter: emitter.clone(),
                    };

                    tokio::spawn(async move {
                        handler.handle(read.command).await;
                    });
                }

                Err(err) => {
                    emitter.emit(KiwiTalkClientEvent::Error(err.into())).await;
                }
            }
        }
    }
}

#[derive(Debug)]
struct Handler<Listener> {
    client: Arc<ClientShared>,
    emitter: HandlerEmitter<Listener>,
}

impl<Listener: Sink<KiwiTalkClientEvent> + Unpin> Handler<Listener> {
    pub async fn handle(&mut self, command: BsonCommand<Document>) {
        if let Err(err) = self.handle_inner(command).await {
            self.emitter.emit(KiwiTalkClientEvent::Error(err)).await;
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
        let chatlog = data.chatlog.clone();
        self.client
            .connection()
            .pool
            .spawn_task(move |connection| {
                connection
                    .chat()
                    .insert(&chat_model_from_chatlog(&chatlog))?;
                Ok(())
            })
            .await?;

        self.emitter
            .emit(
                ChannelEvent::Chat(ReceivedChat {
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
        self.client
            .connection()
            .pool
            .spawn_task(move |connection| {
                connection
                    .user()
                    .update_watermark(data.user_id, data.chat_id, data.watermark)?;
                Ok(())
            })
            .await?;

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
