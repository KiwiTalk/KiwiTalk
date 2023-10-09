use anyhow::{anyhow, Context};
use kiwi_talk_result::TauriResult;
use serde::Serialize;
use talk_api_internal::{account::MoreSettings, profile::MeProfile};

use crate::{auth::CredentialState, create_api_client, ClientState};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogonProfile {
    pub name: String,

    pub id: String,
    pub id_searchable: bool,

    pub email: String,
    pub email_verified: bool,

    pub status_message: String,

    pub pstn_number: String,

    pub profile_url: String,
    pub background_url: String,
}

#[tauri::command]
pub(super) async fn me(
    cred: CredentialState<'_>,
    client: ClientState<'_>,
) -> TauriResult<LogonProfile> {
    let Some(access_token) = cred.read().as_ref().map(|cred| cred.access_token.clone()) else {
        return Err(anyhow!("not logon").into());
    };

    let api = create_api_client(&client, &access_token);

    let more_settings = MoreSettings::request(api.clone())
        .await
        .context("more_settings api call failed")?;

    let me = MeProfile::request(api)
        .await
        .context("me api call failed")?;

    Ok(LogonProfile {
        name: more_settings.nickname,

        id: more_settings.uuid,
        id_searchable: more_settings.uuid_serachable,

        email: more_settings.email_address,
        email_verified: more_settings.email_verified,

        status_message: me.status_message,

        pstn_number: more_settings.pstn_number,

        profile_url: me.original_profile_image_url,
        background_url: me.original_background_image_url,
    })
}
