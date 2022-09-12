pub mod client;
pub mod conn;
pub mod constants;
pub mod stream;

use kiwi_talk_client::{
    event::KiwiTalkClientEvent, status::ClientStatus, KiwiTalkClient, KiwiTalkClientEventReceiver,
};
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};
use thiserror::Error;
use tokio::sync::{Mutex, RwLock};

use crate::{error::impl_tauri_error, system::SystemInfo};

use self::client::{create_client, CreateClientError};

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

#[derive(Default)]
struct KiwiTalkApp {
    pub credential: RwLock<Option<AppCredential>>,

    pub client: RwLock<Option<KiwiTalkClient>>,
    pub client_events: Mutex<Option<KiwiTalkClientEventReceiver>>,
}

fn setup_plugin<R: Runtime>(handle: &AppHandle<R>) -> tauri::plugin::Result<()> {
    handle.manage(KiwiTalkApp::default());

    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct AppCredential {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: Option<i64>,
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

    #[error(transparent)]
    Client(#[from] CreateClientError),
}

impl_tauri_error!(ClientInitializeError);

#[tauri::command(async)]
async fn initialize_client(
    client_status: ClientStatus,
    app: State<'_, KiwiTalkApp>,
    info: State<'_, SystemInfo>,
) -> Result<(), ClientInitializeError> {
    match &*app.credential.read().await {
        Some(credential) => {
            let mut client_slot = app.client.write().await;
            let mut client_events_slot = app.client_events.lock().await;

            let (client, client_events) = create_client(credential, client_status, info).await?;

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
