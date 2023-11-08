pub mod normal;

use std::ops::Bound;

use anyhow::{anyhow, Context};
use headless_talk::channel::ClientChannel;
use kiwi_talk_result::TauriResult;
use serde::Serialize;
use talk_loco_client::talk::chat::{Chat, ChatContent, ChatType};

use crate::ClientState;

use self::normal::NormalChannel;

#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "content")]
#[serde(rename_all = "camelCase")]
pub(crate) enum Channel {
    Normal(NormalChannel),
}

#[tauri::command(async)]
pub(crate) async fn load_channel(id: String, client: ClientState<'_>) -> TauriResult<Channel> {
    let talk = client.talk()?;

    let channel = talk
        .load_channel(id.parse().context("invalid id")?)
        .await?
        .ok_or_else(|| anyhow!("channel not found"))?;

    match channel {
        ClientChannel::Normal(normal) => Ok(Channel::Normal(NormalChannel::from(normal))),

        _ => Err(anyhow!("unsupported channel types").into()),
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Chatlog {
    log_id: String,
    prev_log_id: Option<String>,

    sender_id: String,
    send_at: i64,

    chat_type: i32,

    content: Option<String>,
    attachment: Option<String>,
    supplement: Option<String>,

    referer: Option<i32>,
}

impl From<talk_loco_client::talk::chat::Chatlog> for Chatlog {
    fn from(log: talk_loco_client::talk::chat::Chatlog) -> Self {
        Chatlog {
            log_id: log.log_id.to_string(),
            prev_log_id: log.prev_log_id.map(|id| id.to_string()),
            sender_id: log.author_id.to_string(),
            send_at: log.send_at,
            chat_type: log.chat.chat_type.0,
            content: log.chat.content.message,
            attachment: log.chat.content.attachment,
            supplement: log.chat.content.supplement,
            referer: log.referer,
        }
    }
}

#[tauri::command(async)]
pub(crate) async fn channel_send_text(
    id: String,
    text: String,
    client: ClientState<'_>,
) -> TauriResult<Chatlog> {
    let talk = client.talk()?;

    let log = talk
        .channel(id.parse().context("invalid channel id")?)
        .send_chat(
            Chat {
                chat_type: ChatType::TEXT,
                content: ChatContent {
                    message: Some(text),
                    ..Default::default()
                },
                message_id: 1,
            },
            false,
        )
        .await
        .context("cannot send chat")?;

    Ok(log.into())
}

#[tauri::command(async)]
pub(crate) async fn channel_load_chat(
    id: String,
    from_log_id: Option<String>,
    count: i64,
    exclusive: bool,
    client: ClientState<'_>,
) -> TauriResult<Vec<Chatlog>> {
    let talk = client.talk()?;

    let chats = talk
        .channel(id.parse().context("invalid channel id")?)
        .load_chat_from(
            match from_log_id {
                Some(from_log_id) => {
                    let log_id = from_log_id.parse().context("invalid logId")?;

                    if exclusive {
                        Bound::Excluded(log_id)
                    } else {
                        Bound::Included(log_id)
                    }
                }

                _ => Bound::Unbounded,
            },
            count,
        )
        .await
        .context("cannot load chats from database")?;

    Ok(chats.into_iter().map(Into::into).collect::<Vec<_>>())
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct ChannelMeta {
    #[serde(rename = "type")]
    meta_type: i32,

    revision: String,

    author_id: String,

    updated_at: f64,

    content: String,
}

impl From<talk_loco_client::talk::channel::ChannelMeta> for ChannelMeta {
    fn from(meta: talk_loco_client::talk::channel::ChannelMeta) -> Self {
        Self {
            meta_type: meta.meta_type,
            revision: meta.revision.to_string(),
            author_id: meta.author_id.to_string(),
            updated_at: meta.updated_at as f64 * 1000.0,
            content: meta.content,
        }
    }
}
