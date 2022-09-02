use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};

use tokio::sync::RwLock;

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .setup(setup_plugin)
        .invoke_handler(generate_handler![set_credential])
        .build()
}

fn setup_plugin<R: Runtime>(handle: &AppHandle<R>) -> tauri::plugin::Result<()> {
    handle.manage(KiwiTalkApp {
        credential: RwLock::const_new(None),
    });

    Ok(())
}

#[derive(Serialize, Deserialize)]
struct AppCredential {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: Option<u64>,
}

struct KiwiTalkApp {
    pub credential: RwLock<Option<AppCredential>>,

    // TODO
    // pub database,
    // pub client,
}

#[tauri::command(async)]
async fn set_credential(credential: Option<AppCredential>, app: State<'_, KiwiTalkApp>) -> Result<(), ()> {
    *app.credential.write().await = credential;

    // Async command using state must return Result. see tauri#4317
    Ok(())
}
