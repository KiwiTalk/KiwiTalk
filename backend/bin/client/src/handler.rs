use std::pin::pin;

use anyhow::Context;
use futures::{Future, Stream, StreamExt};
use headless_talk::{
    event::{channel::ChannelEvent, ClientEvent},
    handler::SessionHandler,
};
use talk_loco_client::{talk::stream::StreamCommand, StreamResult};
use tauri::api::notification::Notification;
use tokio::sync::mpsc;

use super::event::MainEvent;

type EventSender = mpsc::Sender<anyhow::Result<MainEvent>>;

pub(super) async fn run_handler(
    handler: SessionHandler,
    stream: impl Stream<Item = StreamResult<StreamCommand>>,
    tx: EventSender,
) {
    wrap_fut(tx.clone(), async move {
        let mut stream = pin!(stream);

        while let Some(read) = stream.next().await.transpose()? {
            tokio::spawn(wrap_fut(
                tx.clone(),
                handle_read(handler.clone(), read, tx.clone()),
            ));
        }

        Ok(())
    })
    .await;
}

async fn wrap_fut(tx: EventSender, fut: impl Future<Output = anyhow::Result<()>>) {
    match fut.await {
        Ok(value) => value,
        Err(err) => {
            let _ = tx.send(Err(err)).await;
        }
    }
}

async fn handle_read(
    handler: SessionHandler,
    command: StreamCommand,
    tx: EventSender,
) -> anyhow::Result<()> {
    if let Some(event) = handler.handle(command).await? {
        handle_event(event, tx)
            .await
            .context("error while handling event")?;
    }

    Ok(())
}

async fn handle_event(event: ClientEvent, tx: EventSender) -> anyhow::Result<()> {
    match event {
        ClientEvent::Channel {
            id,
            event:
                ChannelEvent::Chat {
                    chat,
                    user_nickname,
                    ..
                },
            ..
        } => {
            let message = chat
                .chat
                .content
                .message
                .as_deref()
                .unwrap_or("Unknown message");

            Notification::new("chat")
                .title(user_nickname.as_deref().unwrap_or("KiwiTalk"))
                .body(message)
                .show()?;

            let _ = tx
                .send(Ok(MainEvent::Chat {
                    channel: format!("{id}"),
                    preview_message: message.to_string(),

                    // TODO:: fix or remove
                    unread_count: 1,
                }))
                .await;
        }

        ClientEvent::Kickout(reason) => {
            let _ = tx.send(Ok(MainEvent::Kickout { reason })).await;
        }

        _ => {}
    }

    Ok(())
}
