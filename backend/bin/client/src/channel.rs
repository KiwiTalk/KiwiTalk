use std::{
    ops::{Bound, DerefMut},
    sync::atomic::{AtomicU32, Ordering},
};

use anyhow::{anyhow, Context};
use dashmap::DashMap;
use headless_talk::channel::ClientChannel;
use kiwi_talk_result::TauriResult;
use serde::Serialize;
use talk_loco_client::talk::chat::{Chat, ChatContent, ChatType};
use tauri::State;

use crate::ClientState;

pub struct ChannelMap {
    counter: AtomicU32,
    map: DashMap<u32, ClientChannel>,
}

impl ChannelMap {
    pub fn new() -> Self {
        Self {
            counter: AtomicU32::new(0),
            map: DashMap::new(),
        }
    }

    pub fn insert(&self, value: ClientChannel) -> u32 {
        let rid = self.counter.fetch_add(1, Ordering::AcqRel);

        self.map.insert(rid, value);

        return rid;
    }

    fn remove(&self, rid: u32) -> Option<ClientChannel> {
        self.map.remove(&rid).map(|(_, value)| value)
    }

    fn get_mut(&self, rid: u32) -> anyhow::Result<impl DerefMut<Target = ClientChannel> + '_> {
        match self.map.get_mut(&rid) {
            Some(channel) => Ok(channel),

            None => Err(anyhow!("cannot find channel")),
        }
    }
}

#[tauri::command(async)]
pub(super) async fn open_channel(
    id: String,
    map: State<'_, ChannelMap>,
    client: ClientState<'_>,
) -> TauriResult<u32> {
    let talk = match &*client.read() {
        Some(client) => client.talk.clone(),

        _ => return Err(anyhow!("client is not created").into()),
    };

    Ok(map.insert(
        talk.open_channel(id.parse().context("invalid id")?)
            .await
            .context("cannot open channel")?
            .ok_or_else(|| anyhow!("cannot find channel"))?,
    ))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Chatlog {
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
pub(super) async fn channel_send_text(
    rid: u32,
    text: String,
    map: State<'_, ChannelMap>,
) -> TauriResult<Chatlog> {
    let channel = map.get_mut(rid)?;

    let log = channel
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
pub(super) async fn channel_load_chat(
    rid: u32,
    from_log_id: Option<String>,
    count: i64,
    exclusive: bool,
    map: State<'_, ChannelMap>,
) -> TauriResult<Vec<Chatlog>> {
    let channel = map.get_mut(rid)?;

    let chats = channel
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

#[tauri::command(async)]
pub(super) async fn channel_read_chat(
    rid: u32,
    log_id: String,
    map: State<'_, ChannelMap>,
) -> TauriResult<()> {
    let channel = map.get_mut(rid)?;

    channel
        .read_chat(log_id.parse().context("invalid logId")?)
        .await
        .context("cannot read chat")?;

    Ok(())
}

#[tauri::command]
pub(super) fn close_channel(rid: u32, map: State<'_, ChannelMap>) -> TauriResult<()> {
    if map.remove(rid).is_none() {
        return Err(anyhow!("cannot find channel").into());
    }

    Ok(())
}
