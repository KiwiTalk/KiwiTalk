pub mod auth;
pub mod global;
pub mod locale;

use parking_lot::RwLock;
use tauri::{AppHandle, Manager, Runtime, State};

use self::global::GlobalConfiguration;

pub type Configuration = RwLock<GlobalConfiguration>;

pub(super) fn setup(handle: &AppHandle<impl Runtime>) {
    handle.manage(Configuration::default());
}

#[tauri::command]
pub(super) async fn get_global_configuration(
    configuration: State<'_, Configuration>,
) -> Result<GlobalConfiguration, ()> {
    Ok(configuration.read().clone())
}

#[tauri::command]
pub(super) fn set_global_configuration(
    configuration: GlobalConfiguration,
    configuration_state: State<'_, Configuration>,
) {
    *configuration_state.write() = configuration;
}
