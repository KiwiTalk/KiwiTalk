pub mod client;
pub mod configuration;
pub mod conn;
pub mod constants;
pub mod stream;

use std::{
    future::Future,
    pin::Pin,
    task::{Context, Poll},
};

use futures::{pin_mut, FutureExt};
use kiwi_talk_client::{
    event::KiwiTalkClientEvent, status::ClientStatus, KiwiTalkClient, KiwiTalkClientEventReceiver,
};
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin, self},
    AppHandle, Manager, Runtime, State,
};
use thiserror::Error;

use crate::{error::impl_tauri_error, system::SystemInfo};

use self::client::{create_client, CreateClientError};

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .setup(setup_plugin)
        .invoke_handler(generate_handler![
            set_credential,
            initialize_client,
            next_client_event,
            destroy_client
        ])
        .build()
}

#[derive(Default)]
struct KiwiTalkApp {
    pub credential: RwLock<Option<AppCredential>>,

    pub client: RwLock<Option<KiwiTalkClient>>,
    pub client_events: Mutex<Option<KiwiTalkClientEventReceiver>>,
}

fn setup_plugin<R: Runtime>(handle: &AppHandle<R>) -> plugin::Result<()> {
    handle.manage(KiwiTalkApp::default());

    Ok(())
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
    app: State<'_, KiwiTalkApp>,
) -> Result<(), ()> {
    *app.credential.write() = credential;
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
    let credential = app.credential.read().clone();

    match credential {
        Some(credential) => {
            let (client, client_events) = create_client(&credential, client_status, info).await?;

            let mut client_slot = app.client.write();
            let mut client_events_slot = app.client_events.lock();

            *client_slot = Some(client);
            *client_events_slot = Some(client_events);

            Ok(())
        }

        None => Err(ClientInitializeError::CredentialNotSet),
    }
}

struct ClientEventFuture<'a> {
    app: State<'a, KiwiTalkApp>,
}

impl<'a> Future for ClientEventFuture<'a> {
    type Output = Option<KiwiTalkClientEvent>;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        match &mut *self.app.client_events.lock() {
            Some(receiver) => {
                let recv = receiver.recv();
                pin_mut!(recv);

                recv.poll(cx)
            }

            None => Poll::Ready(None),
        }
    }
}

// Async command using state must return Result. see tauri#4317
#[tauri::command(async)]
fn next_client_event(
    app: State<'_, KiwiTalkApp>,
) -> impl Future<Output = Result<Option<KiwiTalkClientEvent>, ()>> + '_ {
    ClientEventFuture { app }.map(Result::Ok)
}

#[tauri::command]
fn destroy_client(app: State<'_, KiwiTalkApp>) -> bool {
    let mut client = app.client.write();
    if client.is_none() {
        return false;
    }

    *client = None;
    *app.client_events.lock() = None;
    true
}
