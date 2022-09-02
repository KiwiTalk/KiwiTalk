use kiwi_talk_client::{
    event::KiwiTalkClientEvent, ClientCredential, KiwiTalkClient, KiwiTalkClientEventReceiver,
};
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};

use tokio::sync::{Mutex, RwLock};

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
    pub user_id: Option<u64>,
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

#[tauri::command(async)]
async fn initialize_client(app: State<'_, KiwiTalkApp>) -> Result<(), ()> {
    // TODO:: Return error if credential is not set
    match &*app.credential.read().await {
        Some(credential) => {
            let mut client_slot = app.client.write().await;
            let mut client_events_slot = app.client_events.lock().await;

            let (client, client_events) = KiwiTalkClient::login(ClientCredential {
                access_token: &credential.access_token,
                device_uuid: crate::auth::constants::DEVICE_UUID, // TODO:: REPLACE
                user_id: credential.user_id,
            })
            .await;

            *client_slot = Some(client);
            *client_events_slot = Some(client_events);

            Ok(())
        }
        None => Err(()),
    }
}

#[tauri::command(async)]
async fn next_client_event(app: State<'_, KiwiTalkApp>) -> Result<Option<KiwiTalkClientEvent>, ()> {
    Ok(match &mut *app.client_events.lock().await {
        Some(receiver) => receiver.recv().await,
        None => None,
    })
}
