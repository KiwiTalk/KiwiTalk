use anyhow::Context;
use kiwi_talk_result::TauriResult;
use serde::Serialize;

use crate::ClientState;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct NormalChannel {
    users: Vec<(String, NormalChannelUser)>,
}

impl From<headless_talk::channel::normal::NormalChannel> for NormalChannel {
    fn from(normal: headless_talk::channel::normal::NormalChannel) -> Self {
        Self {
            users: normal
                .users
                .iter()
                .cloned()
                .map(|(id, user)| (id.to_string(), NormalChannelUser::from(user)))
                .collect(),
        }
    }
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

#[tauri::command(async)]
pub(crate) async fn normal_channel_read_chat(
    id: String,
    log_id: String,
    client: ClientState<'_>,
) -> TauriResult<()> {
    let talk = client.talk()?;

    talk.normal_channel(id.parse().context("invalid channel id")?)
        .read_chat(log_id.parse().context("invalid logId")?)
        .await
        .context("cannot read chat")?;

    Ok(())
}
