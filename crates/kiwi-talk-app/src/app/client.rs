use futures::Sink;
use kiwi_talk_client::{
    channel::{ChannelDataVariant, ChannelId},
    config::KiwiTalkClientInfo,
    database::pool::{DatabasePool, PoolTaskError},
    error::KiwiTalkClientError,
    event::KiwiTalkClientEvent,
    status::ClientStatus,
    ClientCredential, KiwiTalkClient, KiwiTalkClientBuilder,
};
use tauri::State;
use thiserror::Error;

use crate::{error::impl_tauri_error, system::SystemInfo};

use super::{
    conn::checkin,
    constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION},
    stream::{create_secure_stream, LOCO_CLIENT_SECURE_SESSION},
    AppCredential,
};

pub async fn create_client<C: Default + Extend<(ChannelId, ChannelDataVariant)>>(
    credential: &AppCredential,
    client_status: ClientStatus,
    info: State<'_, SystemInfo>,
    sink: impl Sink<KiwiTalkClientEvent> + Send + Unpin + 'static,
) -> Result<(KiwiTalkClient, C), CreateClientError> {
    let checkin_res = checkin(credential.user_id.unwrap_or(1))
        .await
        .map_err(|_| CreateClientError::Checkin)?;

    let loco_session = create_secure_stream(
        &LOCO_CLIENT_SECURE_SESSION,
        (checkin_res.host.as_str(), checkin_res.port as u16),
    )
    .await
    .map_err(|_| CreateClientError::LocoHandshake)?;

    let pool = DatabasePool::file("file:memdb?mode=memory&cache=shared")
        .map_err(|err| CreateClientError::Database(err.into()))?;
    pool.migrate_to_latest().await?;

    Ok(KiwiTalkClientBuilder::new(loco_session, pool, sink)
        .status(client_status)
        .login(
            KiwiTalkClientInfo {
                os: TALK_OS,
                net_type: TALK_NET_TYPE,
                app_version: TALK_VERSION,
                mccmnc: TALK_MCCMNC,
                language: info.device_info.language(),
                device_type: TALK_DEVICE_TYPE,
            },
            ClientCredential {
                access_token: &credential.access_token,
                device_uuid: info.device_info.device_uuid.as_str(),
                user_id: credential.user_id,
            },
        )
        .await?)
}

#[derive(Debug, Error)]
pub enum CreateClientError {
    #[error("Checkin failed")]
    Checkin,

    #[error("Loco stream handshake failed")]
    LocoHandshake,

    #[error("Database initialization failed. {0}")]
    Database(#[from] PoolTaskError),

    #[error(transparent)]
    Client(#[from] KiwiTalkClientError),
}

impl_tauri_error!(CreateClientError);
