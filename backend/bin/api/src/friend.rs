use anyhow::Context;
use kiwi_talk_result::TauriResult;
use serde::Serialize;
use talk_api_internal::friend::FriendsDiff;

use crate::{
    auth::{CredentialExt, CredentialState},
    create_api_client, ClientState,
};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Friend {
    pub user_id: String,

    pub nickname: String,

    pub user_type: i32,
    pub user_category: i32,

    pub status_message: String,

    pub friend_nickname: Option<String>,
    pub phonetic_name: Option<String>,

    pub profile_image_url: String,

    pub direct_chat_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct FriendsUpdate {
    pub added: Vec<Friend>,
    pub removed_ids: Vec<String>,
}

#[tauri::command]
pub(super) async fn update_friends(
    cred: CredentialState<'_>,
    client: ClientState<'_>,
    friend_ids: Vec<String>,
) -> TauriResult<FriendsUpdate> {
    let access_token = cred.read().try_access_token()?.to_owned();

    let ids = friend_ids
        .into_iter()
        .map(|id| id.parse())
        .collect::<Result<Vec<u64>, _>>()
        .context("invalid friend ids")?;

    let res = FriendsDiff::request(create_api_client(&client, &access_token), &ids)
        .await
        .context("diff api call failed")?;

    Ok(FriendsUpdate {
        added: res
            .added_friends
            .into_iter()
            .map(|friend| Friend {
                user_id: friend.user_id.to_string(),
                nickname: friend.nickname,
                user_type: friend.user_type,
                user_category: friend.user_category,
                status_message: friend.status_message,
                friend_nickname: friend.friend_nickname,
                phonetic_name: friend.phonetic_name,
                profile_image_url: friend.original_profile_image_url,
                direct_chat_id: friend.direct_chat_id.map(|id| id.to_string()),
            })
            .collect(),
        removed_ids: res
            .deleted_ids
            .into_iter()
            .map(|id| id.to_string())
            .collect(),
    })
}
