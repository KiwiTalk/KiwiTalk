use arrayvec::ArrayVec;
use headless_talk::channel::ListPreviewChat;
use serde::Serialize;

use kiwi_talk_result::TauriResult;

use crate::ClientState;

#[tauri::command(async)]
pub(crate) async fn channel_list(
    client: ClientState<'_>,
) -> TauriResult<Vec<(String, ChannelListItem)>> {
    let talk = client.talk()?;

    Ok(talk
        .channel_list()
        .await?
        .into_iter()
        .map(|(id, item)| (id.to_string(), ChannelListItem::from(item)))
        .collect())
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]

pub(crate) struct DisplayUser {
    id: String,
    nickname: String,
    profile_url: Option<String>,
}

impl From<headless_talk::user::DisplayUser> for DisplayUser {
    fn from(value: headless_talk::user::DisplayUser) -> Self {
        Self {
            id: value.id.to_string(),
            nickname: value.profile.nickname,
            profile_url: value.profile.image_url,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ChannelListItem {
    channel_type: String,

    display_users: ArrayVec<DisplayUser, 4>,

    last_chat: Option<PreviewChat>,

    name: String,
    profile: Option<String>,

    user_count: i32,
    unread_count: i32,
}

impl From<headless_talk::channel::ChannelListItem> for ChannelListItem {
    fn from(item: headless_talk::channel::ChannelListItem) -> Self {
        Self {
            channel_type: item.channel_type.as_str().to_owned(),
            display_users: item
                .display_users
                .into_iter()
                .map(DisplayUser::from)
                .collect::<ArrayVec<_, 4>>(),
            last_chat: item.last_chat.map(PreviewChat::from),
            name: item.profile.name,
            profile: item.profile.image_url,
            user_count: item.active_user_count,
            unread_count: item.unread_count,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PreviewChat {
    pub user: Option<DisplayUser>,

    pub chat_type: i32,
    pub content: Option<String>,
    pub attachment: Option<String>,
    pub timestamp: f64,
}

impl From<ListPreviewChat> for PreviewChat {
    fn from(chat: ListPreviewChat) -> Self {
        PreviewChat {
            user: chat.user.map(DisplayUser::from),
            chat_type: chat.chatlog.chat.chat_type.0,
            content: chat.chatlog.chat.content.message,
            attachment: chat.chatlog.chat.content.attachment,
            timestamp: chat.chatlog.send_at as f64 * 1000.0,
        }
    }
}
