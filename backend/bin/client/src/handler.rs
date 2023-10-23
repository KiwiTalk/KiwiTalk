use headless_talk::event::{channel::ChannelEvent, ClientEvent};
use tauri::api::notification::Notification;
use tokio::sync::mpsc;

use super::event::MainEvent;

type EventSender = mpsc::Sender<anyhow::Result<MainEvent>>;

pub async fn handle_event(event: ClientEvent, tx: EventSender) -> anyhow::Result<()> {
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
