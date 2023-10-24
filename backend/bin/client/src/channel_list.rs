use anyhow::anyhow;
use arrayvec::ArrayVec;
use serde::Serialize;

use kiwi_talk_result::TauriResult;

use super::ClientState;

#[tauri::command(async)]
pub(super) async fn channel_list(
    client: ClientState<'_>,
) -> TauriResult<Vec<(String, ChannelListItem)>> {
    let talk = match &*client.read() {
        Some(client) => client.talk.clone(),

        _ => return Err(anyhow!("client is not created").into()),
    };

    Ok(talk
        .channel_list()
        .await?
        .into_iter()
        .map(|(id, item)| {
            (
                id.to_string(),
                ChannelListItem {
                    channel_type: item.channel_type.as_str().to_owned(),
                    display_users: item
                        .display_users
                        .into_iter()
                        .map(|user| {
                            (
                                user.id.to_string(),
                                DisplayProfile {
                                    nickname: user.profile.nickname,
                                    profile_url: user.profile.image_url,
                                },
                            )
                        })
                        .collect::<ArrayVec<_, 4>>(),
                    last_chat: item.last_chat.map(|list_chat| PreviewChat {
                        profile: list_chat.profile.map(|profile| DisplayProfile {
                            nickname: profile.nickname,
                            profile_url: profile.image_url,
                        }),
                        chat_type: list_chat.chatlog.chat.chat_type.0,
                        content: list_chat.chatlog.chat.content.message,
                        attachment: list_chat.chatlog.chat.content.attachment,
                        timestamp: list_chat.chatlog.send_at as f64 * 1000.0,
                    }),
                    name: item.name,
                    profile: item.profile_image,
                    user_count: item.active_user_count,
                    unread_count: item.unread_count,
                },
            )
        })
        .collect())
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]

pub(super) struct DisplayProfile {
    nickname: String,
    profile_url: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ChannelListItem {
    channel_type: String,

    display_users: ArrayVec<(String, DisplayProfile), 4>,

    last_chat: Option<PreviewChat>,

    name: String,
    profile: Option<String>,

    user_count: i32,
    unread_count: i32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PreviewChat {
    pub profile: Option<DisplayProfile>,

    pub chat_type: i32,
    pub content: Option<String>,
    pub attachment: Option<String>,
    pub timestamp: f64,
}
