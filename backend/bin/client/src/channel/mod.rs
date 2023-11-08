pub mod normal;

use std::ops::Bound;

use anyhow::{anyhow, Context};
use headless_talk::channel::ClientChannel;
use kiwi_talk_result::TauriResult;
use serde::Serialize;
use talk_loco_client::talk::chat::{Chat, ChatContent, ChatType};

use crate::ClientState;

#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "content")]
pub(crate) enum Channel {
    Normal {
        users: Vec<(String, NormalChannelUser)>,
    },
}

#[tauri::command(async)]
pub(crate) async fn load_channel(id: String, client: ClientState<'_>) -> TauriResult<Channel> {
    let talk = client.talk()?;

    let channel = talk
        .load_channel(id.parse().context("invalid id")?)
        .await?
        .ok_or_else(|| anyhow!("channel not found"))?;

    match channel {
        ClientChannel::Normal(normal) => Ok(Channel::Normal {
            users: normal
                .users
                .iter()
                .cloned()
                .map(|(id, user)| (id.to_string(), NormalChannelUser::from(user)))
                .collect(),
        }),

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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NormalChannelUser {
    nickname: String,

    profile_url: String,
    full_profile_url: String,
    original_profile_url: String,

    country_iso: String,
    status_message: String,
    account_id: String,
    linked_services: String,
    suspended: bool,

    watermark: String,
}

impl From<headless_talk::channel::normal::user::NormalChannelUser> for NormalChannelUser {
    fn from(user: headless_talk::channel::normal::user::NormalChannelUser) -> Self {
        Self {
            nickname: user.profile.nickname,
            profile_url: user.profile.image_url,
            full_profile_url: user.profile.full_image_url,
            original_profile_url: user.profile.original_image_url,
            country_iso: user.country_iso,
            status_message: user.status_message,
            account_id: user.account_id.to_string(),
            linked_services: user.linked_services,
            suspended: user.suspended,
            watermark: user.watermark.to_string(),
        }
    }
}
