pub mod agent;
pub mod auth;
pub mod credential;
pub mod response;
pub mod profile;

use thiserror::Error;

#[derive(Debug, Error)]
#[error(transparent)]
pub struct ApiRequestError(#[from] reqwest::Error);

type ApiResult<T> = Result<T, ApiRequestError>;
