use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime, State};

pub type CredentialState<'a> = State<'a, RwLock<Option<AppCredential>>>;

pub(super) fn setup(handle: &AppHandle<impl Runtime>) {
    handle.manage::<RwLock<Option<AppCredential>>>(RwLock::new(None));
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AppCredential {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: Option<i64>,
}

#[tauri::command]
pub(super) fn set_credential(
    credential: Option<AppCredential>,
    state: State<'_, CredentialState>,
) -> Result<(), ()> {
    *state.write() = credential;
    Ok(())
}
