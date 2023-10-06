pub mod account;
pub mod agent;
pub mod auth;
pub mod config;
pub mod credential;
pub mod profile;

use config::Config;
use credential::Credential;
use reqwest::{header, RequestBuilder, Response};
use serde::{de::DeserializeOwned, Deserialize};
use thiserror::Error;

#[derive(Debug, Error)]
#[error(transparent)]
pub enum ApiRequestError {
    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),

    Deserialize(#[from] serde_json::Error),

    #[error("request failed with status: {0}")]
    Status(i32),
}

pub type ApiResult<T> = Result<T, ApiRequestError>;

#[derive(Debug, Clone, Deserialize)]
pub struct StatusResponse {
    pub status: i32,
}

pub(crate) async fn read_simple_response<T: DeserializeOwned>(response: Response) -> ApiResult<T> {
    let data = response.bytes().await?;

    match serde_json::from_slice::<StatusResponse>(&data)?.status {
        0 => Ok(serde_json::from_slice(&data)?),
        status => Err(ApiRequestError::Status(status)),
    }
}

pub(crate) fn fill_api_headers(builder: RequestBuilder, config: Config) -> RequestBuilder {
    let user_agent = config.get_user_agent();

    builder
        .header(header::USER_AGENT, user_agent)
        .header(
            "A",
            format!(
                "{}/{}/{}",
                config.agent.agent(),
                config.version,
                config.language
            ),
        )
        .header(header::ACCEPT, "*/*")
        .header(header::ACCEPT_LANGUAGE, config.language)
}

pub(crate) fn fill_credential(builder: RequestBuilder, credential: Credential) -> RequestBuilder {
    builder.header(
        header::AUTHORIZATION,
        format!("{}-{}", credential.access_token, credential.device_uuid),
    )
}
