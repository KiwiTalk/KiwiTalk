use anyhow::{anyhow, Context};
use kiwi_talk_result::TauriResult;
use serde::Serialize;
use talk_api_internal::{
    account::MoreSettings,
    profile::{FriendInfo, Me as APIMeProfile},
};

use crate::{auth::CredentialState, create_api_client, ClientState};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub id: String,

    pub status_message: String,

    pub profile_url: String,
    pub background_url: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MeProfile {
    pub nickname: String,

    pub uuid: String,
    pub uuid_searchable: bool,

    pub email: String,
    pub email_verified: bool,

    pub pstn_number: String,

    pub profile: Profile,
}

#[tauri::command]
pub(super) async fn me_profile(
    cred: CredentialState<'_>,
    client: ClientState<'_>,
) -> TauriResult<MeProfile> {
    let Some(access_token) = cred.read().as_ref().map(|cred| cred.access_token.clone()) else {
        return Err(anyhow!("not logon").into());
    };

    let api = create_api_client(&client, &access_token);

    let more_settings = MoreSettings::request(api.clone())
        .await
        .context("more_settings api call failed")?;

    let me = APIMeProfile::request(api)
        .await
        .context("me api call failed")?;

    Ok(MeProfile {
        nickname: me.profile.nickname,

        uuid: more_settings.uuid,
        uuid_searchable: more_settings.uuid_serachable,

        email: more_settings.email_address,
        email_verified: more_settings.email_verified,

        pstn_number: more_settings.pstn_number,

        profile: Profile {
            id: me.profile.user_id.to_string(),
            status_message: me.profile.status_message,
            profile_url: me.profile.original_profile_image_url,
            background_url: me.profile.original_background_image_url,
        },
    })
}

#[tauri::command]
pub(super) async fn friend_profile(
    id: String,
    cred: CredentialState<'_>,
    client: ClientState<'_>,
) -> TauriResult<Profile> {
    let Some(access_token) = cred.read().as_ref().map(|cred| cred.access_token.clone()) else {
        return Err(anyhow!("not logon").into());
    };

    let res = FriendInfo::request(
        create_api_client(&client, &access_token),
        id.parse().context("invalid id")?,
    )
    .await
    .context("friend_info api call failed")?;

    Ok(Profile {
        id: res.profile.user_id.to_string(),
        status_message: res.profile.status_message,
        profile_url: res.profile.original_profile_image_url,
        background_url: res.profile.original_background_image_url,
    })
}
