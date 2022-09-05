pub mod conn;
pub mod constants;
pub mod stream;

use kiwi_talk_client::{
    event::KiwiTalkClientEvent, ClientCredential, KiwiTalkClient, KiwiTalkClientEventReceiver,
};
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};
use thiserror::Error;
use tokio::sync::{Mutex, RwLock};

use crate::error::impl_tauri_error;

use self::{
    conn::{checkin, ConnError},
    stream::{create_secure_stream, LOCO_CLIENT_SECURE_SESSION},
};

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .setup(setup_plugin)
        .invoke_handler(generate_handler![
            set_credential,
            initialize_client,
            next_client_event
        ])
        .build()
}

fn setup_plugin<R: Runtime>(handle: &AppHandle<R>) -> tauri::plugin::Result<()> {
    handle.manage(KiwiTalkApp::default());

    Ok(())
}

#[derive(Serialize, Deserialize)]
struct AppCredential {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: Option<i64>,
}

#[derive(Default)]
struct KiwiTalkApp {
    pub credential: RwLock<Option<AppCredential>>,

    pub client: RwLock<Option<KiwiTalkClient>>,
    pub client_events: Mutex<Option<KiwiTalkClientEventReceiver>>,
}

#[tauri::command(async)]
async fn set_credential(
    credential: Option<AppCredential>,
    app: State<'_, KiwiTalkApp>,
) -> Result<(), ()> {
    *app.credential.write().await = credential;

    // Async command using state must return Result. see tauri#4317
    Ok(())
}

#[derive(Debug, Error)]
pub enum ClientInitializeError {
    #[error("Credential is not set")]
    CredentialNotSet,

    #[error("Checkin failed")]
    Checkin,

    #[error("Loco stream handshake failed")]
    LocoHandshake,

    #[error("Error while initializing client")]
    Client,
}

impl_tauri_error!(ClientInitializeError);

#[tauri::command(async)]
async fn initialize_client(app: State<'_, KiwiTalkApp>) -> Result<(), ClientInitializeError> {
    match &*app.credential.read().await {
        Some(credential) => {
            let mut client_slot = app.client.write().await;
            let mut client_events_slot = app.client_events.lock().await;

            let checkin_res = checkin(credential.user_id.unwrap_or(1))
                .await
                .map_err(|_| ClientInitializeError::Checkin)?;
            if checkin_res.status != 0 || checkin_res.data.is_none() {
                return Err(ClientInitializeError::Checkin);
            }
            let checkin_res = checkin_res.data.unwrap();

            let loco_session = create_secure_stream(
                &LOCO_CLIENT_SECURE_SESSION,
                (checkin_res.host.as_str(), checkin_res.port as u16),
            )
            .await
            .map_err(|_| ClientInitializeError::LocoHandshake)?;

            let (client, client_events) = KiwiTalkClient::login(
                loco_session,
                ClientCredential {
                    access_token: &credential.access_token,
                    device_uuid: crate::auth::constants::DEVICE_UUID, // TODO:: REPLACE
                    user_id: credential.user_id,
                },
            )
            .await
            .map_err(|_| ClientInitializeError::Client)?;

            *client_slot = Some(client);
            *client_events_slot = Some(client_events);

            Ok(())
        }
        None => Err(ClientInitializeError::CredentialNotSet),
    }
}

#[tauri::command(async)]
async fn next_client_event(app: State<'_, KiwiTalkApp>) -> Result<Option<KiwiTalkClientEvent>, ()> {
    Ok(match &mut *app.client_events.lock().await {
        Some(receiver) => receiver.recv().await,
        None => None,
    })
}
