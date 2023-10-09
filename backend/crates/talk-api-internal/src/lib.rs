pub mod account;
pub mod agent;
pub mod auth;
pub mod client;
pub mod config;
pub mod credential;
pub mod friend;
pub mod profile;

use reqwest::Response;
use serde::{de::DeserializeOwned, Deserialize};
use thiserror::Error;

#[derive(Debug, Error)]
#[error(transparent)]
#[non_exhaustive]
pub enum RequestError {
    Reqwest(#[from] reqwest::Error),
    Json(#[from] serde_json::Error),
    Url(#[from] url::ParseError),
}

pub type RequestResult<T> = Result<T, RequestError>;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error(transparent)]
    Request(RequestError),

    #[error("api responded with error. status: {0}")]
    Status(i32),
}

impl<T: Into<RequestError>> From<T> for ApiError {
    fn from(value: T) -> Self {
        Self::Request(value.into())
    }
}

pub type ApiResult<T> = Result<T, ApiError>;

#[derive(Debug, Clone, Copy, Deserialize)]
pub(crate) struct ApiStatus {
    pub status: i32,
}

pub(crate) async fn read_simple_response<T: DeserializeOwned>(response: Response) -> ApiResult<T> {
    let data = response.bytes().await?;

    match serde_json::from_slice::<ApiStatus>(&data)?.status {
        0 => Ok(serde_json::from_slice(&data)?),
        status => Err(ApiError::Status(status)),
    }
}
