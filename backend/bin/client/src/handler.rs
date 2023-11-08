use headless_talk::event::{
    channel::ChannelEvent as TalkChannelEvent, ClientEvent as TalkClientEvent,
};
use tauri::api::notification::Notification;
use tokio::sync::mpsc;

use crate::event::ChannelEvent;

use super::event::ClientEvent;

type EventSender = mpsc::Sender<anyhow::Result<ClientEvent>>;

pub(crate) async fn handle_event(event: TalkClientEvent, tx: EventSender) -> anyhow::Result<()> {
    match event {
        TalkClientEvent::Channel { id, event } => {
            handle_channel_event(id, event, tx).await?;
        }

        TalkClientEvent::SwitchServer => {
            let _ = tx.send(Ok(ClientEvent::SwitchServer)).await;
        }

        TalkClientEvent::Kickout(reason) => {
            let _ = tx.send(Ok(ClientEvent::Kickout { reason })).await;
        }

        _ => {}
    }

    Ok(())
}

async fn handle_channel_event(
    id: i64,
    event: TalkChannelEvent,
    tx: EventSender,
) -> anyhow::Result<()> {
    match event {
        TalkChannelEvent::Chat {
            chat,
            user_nickname,
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
                .send(Ok(ClientEvent::Channel {
                    channel: id.to_string(),
                    event: ChannelEvent::Chat(chat.into()),
                }))
                .await;
        }

        TalkChannelEvent::ChatRead { user_id, log_id } => {
            let _ = tx
                .send(Ok(ClientEvent::Channel {
                    channel: id.to_string(),
                    event: ChannelEvent::ChatRead {
                        user_id: user_id.to_string(),
                        log_id: log_id.to_string(),
                    },
                }))
                .await;
        }

        TalkChannelEvent::MetaChanged(meta) => {
            let _ = tx
                .send(Ok(ClientEvent::Channel {
                    channel: id.to_string(),
                    event: ChannelEvent::MetaChanged(meta.into()),
                }))
                .await;
        }

        TalkChannelEvent::ChatDeleted(chatlog) => {
            let _ = tx
                .send(Ok(ClientEvent::Channel {
                    channel: id.to_string(),
                    event: ChannelEvent::ChatDeleted(chatlog.into()),
                }))
                .await;
        }

        TalkChannelEvent::Added { chatlog } => {
            let _ = tx
                .send(Ok(ClientEvent::Channel {
                    channel: id.to_string(),
                    event: ChannelEvent::Added(chatlog.map(|log| log.into())),
                }))
                .await;
        }

        TalkChannelEvent::Left => {
            let _ = tx
                .send(Ok(ClientEvent::Channel {
                    channel: id.to_string(),
                    event: ChannelEvent::Left,
                }))
                .await;
        }
    }

    Ok(())
}
