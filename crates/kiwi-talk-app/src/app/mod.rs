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
use kiwi_talk_client::{
    channel::{ChannelDataVariant, ChannelId},
    event::KiwiTalkClientEvent,
    status::ClientStatus,
    KiwiTalkClient,
};
use nohash_hasher::IntMap;
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use thiserror::Error;

use crate::{error::impl_tauri_error, system::SystemInfo};

use self::client::{create_client, CreateClientError};
use self::configuration::global::GlobalConfiguration;

type Credential = RwLock<Option<AppCredential>>;
type Configuration = RwLock<GlobalConfiguration>;

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    // TODO:: load & save global configuration from disk

    Builder::new(name)
        .setup(|handle| {
            handle.manage(Configuration::default());
            handle.manage(Credential::default());
            handle.manage(Client::default());

            Ok(())
        })
        .invoke_handler(generate_handler![
            set_credential,
            initialize_client,
            next_client_event,
            client_user_id,
            destroy_client,
            channels,
            get_global_configuration,
            set_global_configuration
        ])
        .build()
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

#[derive(Default)]
struct Client {
    pub client: RwLock<Option<KiwiTalkClient>>,

    pub event_recv: Mutex<Option<Receiver<KiwiTalkClientEvent>>>,

    pub channels: RwLock<IntMap<ChannelId, ChannelDataVariant>>,
}

#[tauri::command(async)]
async fn initialize_client(
    client_status: ClientStatus,
    credential: State<'_, Credential>,
    state: State<'_, Client>,
    info: State<'_, SystemInfo>,
) -> Result<(), ClientInitializeError> {
    let credential = credential.read().clone();

    match credential {
        Some(credential) => {
            let (sender, recv) = channel(256);
            let (client, channels) =
                create_client(&credential, client_status, info, sender).await?;

            *state.client.write() = Some(client);
            *state.event_recv.lock() = Some(recv);
            *state.channels.write() = channels;

            Ok(())
        }

        None => Err(ClientInitializeError::CredentialNotSet),
    }
}

#[derive(Debug, Error)]
pub enum ClientInitializeError {
    #[error("credential is not set")]
    CredentialNotSet,

    #[error(transparent)]
    Client(#[from] CreateClientError),
}

impl_tauri_error!(ClientInitializeError);

// Async command using state must return Result. see tauri#4317
#[tauri::command(async)]
fn next_client_event(
    state: State<'_, Client>,
) -> impl Future<Output = Result<Option<KiwiTalkClientEvent>, ()>> + '_ {
    poll_fn(move |cx| match &mut *state.event_recv.lock() {
        Some(receiver) => receiver.poll_next_unpin(cx),

        None => Poll::Ready(None),
    })
    .map(Result::Ok)
}

#[tauri::command(async)]
async fn destroy_client(state: State<'_, Client>) -> Result<bool, ()> {
    let mut client = state.client.write();
    if client.is_none() {
        return Ok(false);
    }

    *client = None;
    *state.event_recv.lock() = None;
    state.channels.write().clear();

    Ok(true)
}

#[tauri::command]
fn client_user_id(state: State<'_, Client>) -> Option<i64> {
    Some(state.client.read().as_ref()?.connection().user_id)
}

#[tauri::command]
fn channels(state: State<'_, Client>) -> Vec<(ChannelId, ChannelDataVariant)> {
    state
        .channels
        .read()
        .iter()
        .map(|(id, data)| (*id, data.clone()))
        .collect()
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
