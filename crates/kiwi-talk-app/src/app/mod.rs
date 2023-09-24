mod client;
mod configuration;
mod conn;
mod stream;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

type Credential = RwLock<Option<AppCredential>>;

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    // TODO:: load & save global configuration from disk

    Builder::new(name)
        .setup(|handle| {
            configuration::setup(handle);
            handle.manage(Credential::default());

            Ok(())
        })
        .invoke_handler(generate_handler![
            set_credential,
            /*
            initialize_client,
            next_client_event,
            client_user_id,
            destroy_client,
            channels,
            */
            configuration::get_global_configuration,
            configuration::set_global_configuration
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
