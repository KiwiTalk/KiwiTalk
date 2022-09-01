pub mod agent;
pub mod auth;
pub mod credential;
pub mod response;

use std::{error::Error, fmt::Display, ops::Deref, str::FromStr};

use reqwest::Url;
use serde::{Deserialize, Serialize};

/// Wrapped [reqwest::Url]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiURL(Url);

impl ApiURL {
    pub fn new(scheme: &str, host: &str) -> Option<Self> {
        Some(Self(Url::from_str(&format!("{}://{}", scheme, host)).ok()?))
    }
}

impl Deref for ApiURL {
    type Target = Url;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Debug)]
pub enum ApiRequestError {
    Request(reqwest::Error),
}

impl From<reqwest::Error> for ApiRequestError {
    fn from(err: reqwest::Error) -> Self {
        Self::Request(err)
    }
}

impl Display for ApiRequestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiRequestError::Request(err) => err.fmt(f),
        }
    }
}

impl Error for ApiRequestError {}

type ApiResult<T> = Result<T, ApiRequestError>;
