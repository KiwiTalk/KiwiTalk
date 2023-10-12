pub mod account;
pub mod agent;
pub mod auth;
pub mod client;
pub mod config;
pub mod credential;
pub mod friend;
pub mod profile;

use std::ops::Deref;

use reqwest::RequestBuilder;
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

pub(crate) async fn read_response(request: RequestBuilder) -> ApiResult<impl Deref<Target = [u8]>> {
    #[derive(Debug, Clone, Copy, Deserialize)]
    struct ApiStatus {
        pub status: i32,
    }

    let data = request.send().await?.bytes().await?;

    match serde_json::from_slice::<ApiStatus>(&data)?.status {
        0 => Ok(data),
        status => Err(ApiError::Status(status)),
    }
}

pub(crate) async fn read_structured_response<T: DeserializeOwned>(
    request: RequestBuilder,
) -> ApiResult<T> {
    Ok(serde_json::from_slice(&read_response(request).await?)?)
}
