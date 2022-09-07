use kiwi_talk_client::{
    config::KiwiTalkClientConfig, ClientCredential, KiwiTalkClient, KiwiTalkClientEventReceiver,
};
use talk_loco_command::structs::client::ClientInfo;
use thiserror::Error;

use crate::error::impl_tauri_error;

use super::{
    conn::checkin,
    stream::{create_secure_stream, LOCO_CLIENT_SECURE_SESSION},
    AppCredential, constants::{TALK_OS, TALK_NET_TYPE, TALK_VERSION, TALK_MCCMNC, TALK_DEVIVCE_TYPE},
};

pub async fn create_client(
    credential: &AppCredential,
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
            language: "ko".into(),
            device_type: TALK_DEVIVCE_TYPE,
        },
        ClientCredential {
            access_token: &credential.access_token,
            device_uuid: crate::auth::constants::DEVICE_UUID, // TODO:: REPLACE
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
