use anyhow::{anyhow, Context};
use arrayvec::ArrayVec;
use kiwi_talk_client::chat::{ChatContent, ChatType};
use serde::Serialize;
use talk_loco_client::structs::channel::ChannelMetaType;

use crate::result::TauriResult;

use super::{ClientState, State};

#[tauri::command(async)]
pub(super) async fn channel_list(
    client: ClientState<'_>,
) -> TauriResult<Vec<(String, ChannelListItem)>> {
    let session = match &*client.read() {
        State::Logon { client, .. } => client.session.clone(),

        _ => return Err(anyhow!("not logon").into()),
    };

    let list_channels = session
        .channel_list()
        .await
        .context("cannot load channel list")?;

    let mut items = Vec::with_capacity(list_channels.len());
    for (id, mut channel_data) in list_channels {
        let last_chat = if let Some(last_chat) = channel_data.last_chat {
            Some(PreviewChat {
                // TODO
                nickname: None,
                chat_type: last_chat.chat.chat_type,
                content: last_chat.chat.content,
            })
        } else {
            None
        };

        let name = channel_data
            .metas
            .remove(&(ChannelMetaType::Title as _))
            .map(|meta| meta.content);

        let profile = channel_data
            .metas
            .remove(&(ChannelMetaType::Profile as _))
            .map(|meta| meta.content);

        let display_users = channel_data
            .display_users
            .into_iter()
            .map(|user| DisplayUser {
                nickname: user.profile.nickname,
                profile_url: user.profile.image_url,
            })
            .collect();

        items.push((
            id.to_string(),
            ChannelListItem {
                channel_type: channel_data.channel_type,
                display_users,
                last_chat,
                name,
                profile,
                user_count: channel_data.user_count,

                // TODO
                unread_count: 0,
            },
        ));
    }

    Ok(items)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ChannelListItem {
    channel_type: String,

    display_users: ArrayVec<DisplayUser, 4>,

    last_chat: Option<PreviewChat>,

    name: Option<String>,
    profile: Option<String>,

    user_count: usize,
    unread_count: i32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PreviewChat {
    pub nickname: Option<String>,
    pub chat_type: ChatType,
    pub content: ChatContent,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct DisplayUser {
    nickname: String,
    profile_url: Option<String>,
}
