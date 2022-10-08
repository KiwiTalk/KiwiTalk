use std::sync::Arc;

use bson::Document;
use serde::de::DeserializeOwned;
use talk_loco_client::LocoBroadcastReceiver;
use talk_loco_command::{command::BsonCommand, response::chat};
use tokio::sync::mpsc;

use crate::event::{KiwiTalkClientEvent, KiwiTalkClientHandlerError};

#[derive(Debug)]
pub struct KiwiTalkClientHandler {
    event_sender: mpsc::Sender<KiwiTalkClientEvent>,
}

impl KiwiTalkClientHandler {
    pub fn new(event_sender: mpsc::Sender<KiwiTalkClientEvent>) -> Self {
        Self { event_sender }
    }

    pub async fn emit(&self, event: KiwiTalkClientEvent) {
        self.event_sender.send(event).await.ok();
    }

    pub async fn run(self, mut receiver: LocoBroadcastReceiver) {
        let handler = Arc::new(self);

        while let Some(read) = receiver.recv().await {
            match read {
                Ok(read) => {
                    let command = read.command;
                    let handler = handler.clone();
                    tokio::spawn(async move {
                        if let Err(err) = handler.handle_command(command).await {
                            handler.emit(KiwiTalkClientEvent::Error(err)).await;
                        }
                    });
                }
                Err(_) => {
                    handler
                        .emit(KiwiTalkClientEvent::Error(
                            KiwiTalkClientHandlerError::NetworkRead,
                        ))
                        .await;
                }
            }
        }
    }
}

pub type HandlerResult<T> = Result<T, KiwiTalkClientHandlerError>;

impl KiwiTalkClientHandler {
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

fn map_data<T: DeserializeOwned>(
    method: &str,
    doc: Document,
) -> Result<T, KiwiTalkClientHandlerError> {
    bson::de::from_document(doc)
        .map_err(|_| KiwiTalkClientHandlerError::CommandDecode(method.to_string()))
}
