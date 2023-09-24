use std::{io, pin::pin};

use anyhow::Context;
use futures::{Future, Stream, StreamExt};
use kiwi_talk_client::{
    event::{channel::ChannelEvent, ClientEvent},
    handler::SessionHandler,
};
use talk_loco_client::BoxedCommand;
use tauri::api::notification::Notification;
use tokio::sync::mpsc;

type EventSender = mpsc::Sender<anyhow::Result<ClientEvent>>;

pub(super) async fn run_handler(
    handler: SessionHandler,
    stream: impl Stream<Item = io::Result<BoxedCommand>>,
    tx: EventSender,
) {
    wrap_fut(tx.clone(), async move {
        let mut stream = pin!(stream);

        while let Some(read) = stream.next().await {
            let read = read?;

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
    command: BoxedCommand,
    tx: mpsc::Sender<anyhow::Result<ClientEvent>>,
) -> anyhow::Result<()> {
    if let Some(event) = handler.handle(&command).await? {
        handle_event(&event)
            .await
            .context("error while handling event")?;

        let _ = tx.send(Ok(event));
    }

    Ok(())
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
