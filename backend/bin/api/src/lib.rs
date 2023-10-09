pub mod auth;
pub mod constants;
pub mod profile;

use std::ops::Deref;

use reqwest::Url;
use serde::Serialize;
use talk_api_internal::{
    client::{ApiClient, TalkHttpClient},
    config::Config,
    credential::Credential,
    ApiError, ApiResult, RequestResult,
};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use crate::constants::{TALK_AGENT, TALK_VERSION};
use kiwi_talk_system::{get_system_info, SystemInfo};

#[derive(Debug, Clone)]
#[repr(transparent)]
struct Client(reqwest::Client);

impl Deref for Client {
    type Target = reqwest::Client;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

type ClientState<'a> = State<'a, Client>;

pub async fn init<R: Runtime>() -> TauriPlugin<R> {
    let client = Client(reqwest::Client::new());

    Builder::new("api")
        .setup(|app| {
            app.manage(client);
            auth::init(app);

            Ok(())
        })
        .invoke_handler(generate_handler![
            auth::logon,
            auth::login,
            auth::logout,
            auth::auto_login,
            auth::register_device,
            auth::request_passcode,
            auth::default_login_form,
            profile::me,
        ])
        .build()
}

fn create_api_client<'a>(client: &Client, access_token: &'a str) -> ApiClient<'a> {
    ApiClient::new(
        Credential {
            device_uuid: &get_system_info().device_info.device_uuid,
            access_token,
        },
        create_http_client(client),
    )
}

fn create_http_client(client: &Client) -> TalkHttpClient<'static> {
    TalkHttpClient::new(
        create_config(get_system_info()),
        Url::parse("https://katalk.kakao.com").unwrap(),
        client.0.clone(),
    )
}

fn create_config(info: &SystemInfo) -> Config<'_> {
    Config {
        language: info.device_info.language(),
        version: TALK_VERSION,
        agent: TALK_AGENT,
    }
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content")]
enum Response<T> {
    Success(T),
    Failure(i32),
}

fn result_to_response<T>(result: ApiResult<T>) -> RequestResult<Response<T>> {
    match result {
        Ok(res) => Ok(Response::Success(res)),
        Err(ApiError::Status(status)) => Ok(Response::Failure(status)),
        Err(ApiError::Request(request)) => Err(request),
    }
}
