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

    Ok(vec![])
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
    pub chat_type: i32,
    pub content: Option<String>,
    pub attachment: Option<String>,
    pub timestamp: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct DisplayUser {
    nickname: String,
    profile_url: Option<String>,
}
