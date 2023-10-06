mod constants;

use anyhow::Context;
use kiwi_talk_result::TauriResult;
use reqwest::{Url, Client};
use sha2::{Digest, Sha512};
use talk_api_internal::auth::{
    xvc::XVCHasher, AccountLoginForm, AuthClientConfig, AuthDeviceConfig, TalkAuthApi,
};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Runtime,
};

use crate::constants::{AUTO_LOGIN_KEY, TALK_AGENT, TALK_VERSION, XVC_HASHER};
use kiwi_talk_system::{get_system_info, SystemInfo};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("auth")
        .invoke_handler(generate_handler![register_device, request_passcode])
        .build()
}

pub fn create_auto_login_token(
    auto_login_email: &str,
    refresh_token: &str,
    device_uuid: &str,
) -> [u8; 64] {
    let mut hasher = Sha512::new();

    hasher.update(AUTO_LOGIN_KEY.0);
    hasher.update("|");
    hasher.update(auto_login_email);
    hasher.update("|");
    hasher.update(refresh_token);
    hasher.update("|");
    hasher.update(device_uuid);
    hasher.update("|");
    hasher.update(AUTO_LOGIN_KEY.1);

    hasher.finalize().into()
}

#[tauri::command(async)]
async fn request_passcode(email: String, password: String) -> TauriResult<i32> {
    Ok(create_auth_client()
        .request_passcode(AccountLoginForm {
            email: &email,
            password: &password,
        })
        .await
        .context("request_passcode request failed")?
        .status)
}

#[tauri::command(async)]
async fn register_device(
    passcode: String,
    email: String,
    password: String,
    permanent: bool,
) -> TauriResult<i32> {
    Ok(create_auth_client()
        .register_device(
            &passcode,
            AccountLoginForm {
                email: &email,
                password: &password,
            },
            permanent,
        )
        .await
        .context("register_device request failed")?
        .status)
}

pub fn create_auth_client() -> TalkAuthApi<'static, impl XVCHasher> {
    TalkAuthApi::new(
        create_config(get_system_info()),
        Url::parse("https://katalk.kakao.com").unwrap(),
        XVC_HASHER,
        Client::new(),
    )
}

fn create_config(info: &SystemInfo) -> AuthClientConfig<'_> {
    AuthClientConfig {
        device: AuthDeviceConfig {
            name: &info.device_info.name,
            model: None,
            uuid: &info.device_info.device_uuid,
        },
        language: info.device_info.language(),
        version: TALK_VERSION,
        agent: TALK_AGENT,
    }
}
