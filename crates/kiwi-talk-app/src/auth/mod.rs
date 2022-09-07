pub mod constants;

use serde::Serialize;
use talk_api_client::{
    auth::{resources::LoginData, AccountLoginForm, LoginMethod, TalkAuthClient},
    response::TalkStatusResponse,
};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Runtime,
};

use self::constants::{CONFIG, XVC_HASHER};

pub fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .invoke_handler(generate_handler![login, register_device, request_passcode])
        .build()
}

#[derive(Debug, Clone, Copy)]
struct AuthApiError;
impl Serialize for AuthApiError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str("HTTP API Request failed")
    }
}

type ApiResult<T> = Result<T, AuthApiError>;

#[tauri::command(async)]
async fn login(
    email: String,
    password: String,
    forced: bool,
) -> ApiResult<TalkStatusResponse<LoginData>> {
    let client = TalkAuthClient::new(CONFIG, XVC_HASHER);

    let res = client
        .login(
            LoginMethod::Account(AccountLoginForm {
                email: &email,
                password: &password,
            }),
            forced,
        )
        .await
        .or(Err(AuthApiError))?;

    Ok(res)
}

#[tauri::command(async)]
async fn request_passcode(email: String, password: String) -> ApiResult<TalkStatusResponse<()>> {
    let client = TalkAuthClient::new(CONFIG, XVC_HASHER);

    let res = client
        .request_passcode(AccountLoginForm {
            email: &email,
            password: &password,
        })
        .await
        .or(Err(AuthApiError))?;

    Ok(res)
}

#[tauri::command(async)]
async fn register_device(
    passcode: String,
    email: String,
    password: String,
    permanent: bool,
) -> ApiResult<TalkStatusResponse<()>> {
    let client = TalkAuthClient::new(CONFIG, XVC_HASHER);

    let res = client
        .register_device(
            &passcode,
            AccountLoginForm {
                email: &email,
                password: &password,
            },
            permanent,
        )
        .await
        .or(Err(AuthApiError))?;

    Ok(res)
}
