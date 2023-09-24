use std::{io, pin::pin};

use anyhow::Context;
use futures::{Stream, StreamExt};
use kiwi_talk_client::{
    event::{channel::ChannelEvent, ClientEvent},
    handler::SessionHandler,
    KiwiTalkSession,
};
use talk_loco_client::BoxedCommand;
use tauri::api::notification::Notification;
use tokio::sync::mpsc;

pub(super) async fn run_handler(
    session: KiwiTalkSession,
    buffer: Vec<BoxedCommand>,
    stream: impl Stream<Item = io::Result<BoxedCommand>>,
    tx: mpsc::Sender<anyhow::Result<ClientEvent>>,
) {
    let mut stream = pin!(stream);

    for command in buffer {
        handle_read(SessionHandler::new(&session), command, tx.clone());
    }

    while let Some(read) = stream.next().await {
        let read = match read {
            Ok(read) => read,
            Err(err) => {
                let _ = tx.send(Err(err.into())).await;
                break;
            }
        };

        handle_read(SessionHandler::new(&session), read, tx.clone());
    }
}

fn handle_read(
    handler: SessionHandler,
    command: BoxedCommand,
    tx: mpsc::Sender<anyhow::Result<ClientEvent>>,
) {
    tokio::spawn(async move {
        let _ = tx
            .send(match handler.handle(&command).await {
                Ok(Some(event)) => {
                    if let Err(err) = handle_event(&event)
                        .await
                        .context("error while handling event")
                    {
                        let _ = tx.send(Err(err)).await;
                    }

                    Ok(event)
                }
                Err(err) => Err(anyhow::Error::new(err)).context("error while handling command"),

                _ => return,
            })
            .await;
    });
}

async fn handle_event(event: &ClientEvent) -> anyhow::Result<()> {
    match event {
        ClientEvent::Channel {
            event:
                ChannelEvent::Chat {
                    chat,
                    user_nickname,
                    ..
                },
            ..
        } => {
            Notification::new("chat")
                .title(user_nickname.as_deref().unwrap_or("KiwiTalk"))
                .body(chat.chat.content.message.as_deref().unwrap_or(""))
                .show()?;
        }

        _ => {}
    }

    Ok(())
}
