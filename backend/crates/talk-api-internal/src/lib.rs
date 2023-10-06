pub mod agent;
pub mod auth;
pub mod config;
pub mod credential;
pub mod profile;

use reqwest::Response;
use serde::{Deserialize, de::DeserializeOwned};
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
