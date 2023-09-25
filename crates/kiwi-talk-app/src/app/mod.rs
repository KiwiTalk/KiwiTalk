mod client;
mod configuration;
mod conn;
mod handler;
mod stream;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

type Credential = RwLock<Option<AppCredential>>;

pub(super) fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .setup(|handle| {
            configuration::setup(handle);
            client::setup(handle);

            handle.manage(Credential::default());

            Ok(())
        })
        .invoke_handler(generate_handler![
            set_credential,
            client::initialize_client,
            client::next_client_event,
            client::client_user_id,
            client::destroy_client,
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
