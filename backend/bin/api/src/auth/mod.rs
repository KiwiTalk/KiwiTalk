mod account;

use anyhow::{anyhow, Context};
use kiwi_talk_result::TauriResult;
use kiwi_talk_system::{get_system_info, SystemInfo};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha512};
use talk_api_internal::auth::{
    self as auth_api,
    client::{AuthClient, Device},
    xvc::XvcHasher,
    AccountForm, Login,
};
use tauri::{AppHandle, Manager, Runtime};

use crate::{
    constants::{AUTO_LOGIN_KEY, XVC_HASHER},
    create_http_client, result_to_response, Client, ClientState, Response,
};

use self::account::SavedAccount;

#[tauri::command]
pub(super) fn logon(state: CredentialState) -> bool {
    state.read().is_some()
}

#[tauri::command(async)]
pub(super) async fn default_login_form() -> Result<LoginForm, ()> {
    Ok(account::read()
        .await
        .map(|data| match data {
            Some(data) => LoginForm {
                email: data.email,
                password: String::new(),
                save_email: true,
                auto_login: data.token.is_some(),
            },

            None => Default::default(),
        })
        .unwrap_or_default())
}

#[tauri::command(async)]
pub(super) async fn login(
    form: LoginForm,
    forced: bool,
    cred: CredentialState<'_>,
    client: ClientState<'_>,
) -> TauriResult<Response<()>> {
    let login = match result_to_response(
        Login::request_with_account(
            create_auth_client(&client),
            AccountForm {
                email: &form.email,
                password: &form.password,
            },
            forced,
        )
        .await,
    )
    .context("login request failed")?
    {
        Response::Success(value) => value,
        Response::Failure(status) => return Ok(Response::Failure(status)),
    };

    *cred.write() = Some(Credential {
        user_id: login.user_id,
        access_token: login.access_token,
        refresh_token: login.refresh_token.clone(),
    });

    account::write(if form.save_email {
        let token = if form.auto_login {
            Some(create_auto_login_token(
                &login.auto_login_account_id,
                &login.refresh_token,
                &get_system_info().device_info.device_uuid,
            ))
        } else {
            None
        };

        Some(SavedAccount {
            email: login.auto_login_account_id.clone(),
            token,
        })
    } else {
        None
    })
    .await
    .context("cannot save account information")?;

    Ok(Response::Success(()))
}

#[tauri::command]
pub(super) fn logout(cred: CredentialState<'_>) -> bool {
    cred.write().take().is_some()
}

#[tauri::command(async)]
pub(super) async fn request_passcode(
    email: String,
    password: String,
    client: ClientState<'_>,
) -> TauriResult<Response<()>> {
    Ok(result_to_response(
        auth_api::request_passcode(
            create_auth_client(&client),
            AccountForm {
                email: &email,
                password: &password,
            },
        )
        .await,
    )
    .context("request_passcode request failed")?)
}

#[tauri::command(async)]
pub(super) async fn register_device(
    passcode: String,
    email: String,
    password: String,
    permanent: bool,
    client: ClientState<'_>,
) -> TauriResult<Response<()>> {
    Ok(result_to_response(
        auth_api::register_device(
            create_auth_client(&client),
            AccountForm {
                email: &email,
                password: &password,
            },
            &passcode,
            permanent,
        )
        .await,
    )
    .context("register_device request failed")?)
}

pub(super) fn init(app: &AppHandle<impl Runtime>) {
    app.manage(CredentialStateSlot::new(None));
}

#[tauri::command]
pub(super) async fn auto_login(
    cred: CredentialState<'_>,
    client: ClientState<'_>,
) -> TauriResult<Response<bool>> {
    let Some(SavedAccount {
        email,
        token: Some(token),
    }) = account::read().await.context("cannot read account file")?
    else {
        return Ok(Response::Success(false));
    };

    let login = match result_to_response(
        Login::request_with_token(
            create_auth_client(&client),
            &email,
            &hex::encode(token),
            false,
            false,
        )
        .await,
    )? {
        Response::Success(value) => value,
        Response::Failure(status) => return Ok(Response::Failure(status)),
    };

    *cred.write() = Some(Credential {
        user_id: login.user_id,
        access_token: login.access_token,
        refresh_token: login.refresh_token,
    });

    Ok(Response::Success(true))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Credential {
    pub user_id: u64,
    pub access_token: String,
    pub refresh_token: String,
}

#[easy_ext::ext(CredentialExt)]
pub(crate) impl Option<Credential> {
    fn try_access_token(&self) -> anyhow::Result<&str> {
        self.as_ref()
            .map(|cred| cred.access_token.as_str())
            .ok_or(anyhow!("not logon"))
    }
}

pub type CredentialStateSlot = RwLock<Option<Credential>>;
pub type CredentialState<'a> = tauri::State<'a, CredentialStateSlot>;

fn create_auth_client(client: &Client) -> AuthClient<'_, impl XvcHasher> {
    AuthClient::new(
        create_device(get_system_info()),
        XVC_HASHER,
        create_http_client(client),
    )
}

fn create_device(info: &SystemInfo) -> Device<'_> {
    Device {
        name: &info.device_info.name,
        model: None,
        uuid: &info.device_info.device_uuid,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginForm {
    pub email: String,
    pub password: String,
    pub save_email: bool,
    pub auto_login: bool,
}

impl Default for LoginForm {
    fn default() -> Self {
        Self {
            email: Default::default(),
            password: Default::default(),
            save_email: true,
            auto_login: false,
        }
    }
}

fn create_auto_login_token(email: &str, refresh_token: &str, device_uuid: &str) -> [u8; 64] {
    let mut hasher = Sha512::new();

    hasher.update(AUTO_LOGIN_KEY.0);
    hasher.update("|");
    hasher.update(email);
    hasher.update("|");
    hasher.update(refresh_token);
    hasher.update("|");
    hasher.update(device_uuid);
    hasher.update("|");
    hasher.update(AUTO_LOGIN_KEY.1);

    hasher.finalize().into()
}
