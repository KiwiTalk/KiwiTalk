pub mod account;
pub mod agent;
pub mod auth;
pub mod client;
pub mod config;
pub mod credential;
pub mod friend;
pub mod profile;

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

pub(crate) fn read_response_status(data: &[u8]) -> ApiResult<()> {
    #[derive(Debug, Clone, Copy, Deserialize)]
    struct ApiStatus {
        pub status: i32,
    }

    match serde_json::from_slice::<ApiStatus>(&data)?.status {
        0 => Ok(()),
        status => Err(ApiError::Status(status)),
    }
}

pub(crate) fn read_simple_response<T: DeserializeOwned>(data: &[u8]) -> ApiResult<T> {
    read_response_status(data)?;

    Ok(serde_json::from_slice(data)?)
}
