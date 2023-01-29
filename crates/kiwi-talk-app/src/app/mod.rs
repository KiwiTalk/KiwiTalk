pub mod client;
pub mod configuration;
pub mod conn;
pub mod constants;
pub mod stream;

use std::{future::Future, task::Poll};

use futures::{
    channel::mpsc::{channel, Receiver},
    future::poll_fn,
    FutureExt, StreamExt,
};
use kiwi_talk_client::{event::KiwiTalkClientEvent, status::ClientStatus, KiwiTalkClient};
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use thiserror::Error;

use crate::{error::impl_tauri_error, system::SystemInfo};

use self::{
    client::{create_client, CreateClientError},
    configuration::GlobalConfiguration,
};

type Credential = RwLock<Option<AppCredential>>;
type Configuration = RwLock<GlobalConfiguration>;

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    // TODO:: load & save global configuration from disk
    let app = KiwiTalkApp::default();

    Builder::new(name)
        .setup(|handle| {
            handle.manage(Configuration::default());
            handle.manage(Credential::default());
            handle.manage(app);

            Ok(())
        })
        .invoke_handler(generate_handler![
            set_credential,
            initialize_client,
            next_client_event,
            client_user_id,
            destroy_client,
            get_global_configuration,
            set_global_configuration
        ])
        .build()
}

#[derive(Default)]
struct KiwiTalkApp {
    pub client: RwLock<Option<KiwiTalkClient>>,
    pub client_event_recv: Mutex<Option<Receiver<KiwiTalkClientEvent>>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AppCredential {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: Option<i64>,
}

#[tauri::command]
fn set_credential(
    credential: Option<AppCredential>,
    state: State<'_, Credential>,
) -> Result<(), ()> {
    *state.write() = credential;
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
    credential: State<'_, Credential>,
    app: State<'_, KiwiTalkApp>,
    info: State<'_, SystemInfo>,
) -> Result<(), ClientInitializeError> {
    let credential = credential.read().clone();

    match credential {
        Some(credential) => {
            let (sender, recv) = channel(256);
            let (client, channel_datas) =
                create_client(&credential, client_status, info, sender).await?;

            *app.client.write() = Some(client);
            *app.client_event_recv.lock() = Some(recv);

            Ok(())
        }

        None => Err(ClientInitializeError::CredentialNotSet),
    }
}

// Async command using state must return Result. see tauri#4317
#[tauri::command(async)]
fn next_client_event(
    app: State<'_, KiwiTalkApp>,
) -> impl Future<Output = Result<Option<KiwiTalkClientEvent>, ()>> + '_ {
    poll_fn(move |cx| match &mut *app.client_event_recv.lock() {
        Some(receiver) => receiver.poll_next_unpin(cx),

        None => Poll::Ready(None),
    })
    .map(Result::Ok)
}

#[tauri::command(async)]
async fn destroy_client(app: State<'_, KiwiTalkApp>) -> Result<bool, ()> {
    let mut client = app.client.write();
    if client.is_none() {
        return Ok(false);
    }

    *client = None;
    *app.client_event_recv.lock() = None;
    Ok(true)
}

#[tauri::command]
fn client_user_id(app: State<'_, KiwiTalkApp>) -> Option<i64> {
    Some(app.client.read().as_ref()?.connection().user_id)
}

// Error without Result
#[tauri::command]
async fn get_global_configuration(
    configuration: State<'_, Configuration>,
) -> Result<GlobalConfiguration, ()> {
    Ok(configuration.read().clone())
}

#[tauri::command]
fn set_global_configuration(
    configuration: GlobalConfiguration,
    configuration_state: State<'_, Configuration>,
) {
    *configuration_state.write() = configuration;
}
