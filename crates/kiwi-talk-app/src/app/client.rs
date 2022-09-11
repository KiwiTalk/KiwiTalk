use kiwi_talk_client::{
    config::KiwiTalkClientConfig, ClientCredential, KiwiTalkClient, KiwiTalkClientEventReceiver,
};
use talk_loco_command::structs::client::ClientInfo;
use tauri::State;
use thiserror::Error;

use crate::{error::impl_tauri_error, system::SystemInfo};

use super::{
    conn::checkin,
    constants::{TALK_DEVIVCE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION},
    stream::{create_secure_stream, LOCO_CLIENT_SECURE_SESSION},
    AppCredential,
};

pub async fn create_client(
    credential: &AppCredential,
    info: State<'_, SystemInfo>,
) -> Result<(KiwiTalkClient, KiwiTalkClientEventReceiver), CreateClientError> {
    let checkin_res = checkin(credential.user_id.unwrap_or(1))
        .await
        .map_err(|_| CreateClientError::Checkin)?;

    let loco_session = create_secure_stream(
        &LOCO_CLIENT_SECURE_SESSION,
        (checkin_res.host.as_str(), checkin_res.port as u16),
    )
    .await
    .map_err(|_| CreateClientError::LocoHandshake)?;

    KiwiTalkClient::login(
        loco_session,
        // TODO:: Replace
        KiwiTalkClientConfig {
            client: ClientInfo {
                os: TALK_OS.into(),
                net_type: TALK_NET_TYPE,
                app_version: TALK_VERSION.into(),
                mccmnc: TALK_MCCMNC.into(),
            },
            language: info.device_info.language().into(),
            device_type: TALK_DEVIVCE_TYPE,
        },
        ClientCredential {
            access_token: &credential.access_token,
            device_uuid: info.device_info.device_uuid.as_str(),
            user_id: credential.user_id,
        },
    )
    .await
    .map_err(|_| CreateClientError::Client)
}

#[derive(Debug, Error)]
pub enum CreateClientError {
    #[error("Checkin failed")]
    Checkin,

    #[error("Loco stream handshake failed")]
    LocoHandshake,

    #[error("Error while initializing client")]
    Client,
}

impl_tauri_error!(CreateClientError);
