pub mod agent;
pub mod auth;
pub mod credential;
pub mod response;

use std::{ops::Deref, str::FromStr};

use reqwest::Url;
use serde::{Deserialize, Serialize};
use thiserror::Error;

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

#[derive(Debug, Error)]
pub enum ApiRequestError {
    #[error("HTTP request failed")]
    Request(#[from] reqwest::Error),
}

type ApiResult<T> = Result<T, ApiRequestError>;
