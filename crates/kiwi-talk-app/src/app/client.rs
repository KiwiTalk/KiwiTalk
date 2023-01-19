use futures::Future;
use kiwi_talk_client::{
    config::KiwiTalkClientConfig, event::KiwiTalkClientEvent, status::ClientStatus,
    ClientCredential, KiwiTalkClient,
};
use talk_loco_client::client::ClientRequestError;
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

pub async fn create_client<Fut: Future<Output = ()> + Send + 'static>(
    credential: &AppCredential,
    client_status: ClientStatus,
    info: State<'_, SystemInfo>,
    listener: impl Send + Sync + 'static + Fn(KiwiTalkClientEvent) -> Fut,
) -> Result<KiwiTalkClient, CreateClientError> {
    let checkin_res = checkin(credential.user_id.unwrap_or(1))
        .await
        .map_err(|_| CreateClientError::Checkin)?;

    let loco_session = create_secure_stream(
        &LOCO_CLIENT_SECURE_SESSION,
        (checkin_res.host.as_str(), checkin_res.port as u16),
    )
    .await
    .map_err(|_| CreateClientError::LocoHandshake)?;

    Ok(KiwiTalkClient::login(
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
        client_status,
        listener,
    )
    .await?)
}

#[derive(Debug, Error)]
pub enum CreateClientError {
    #[error("Checkin failed")]
    Checkin,

    #[error("Loco stream handshake failed")]
    LocoHandshake,

    #[error(transparent)]
    Client(#[from] ClientRequestError),
}

impl_tauri_error!(CreateClientError);
