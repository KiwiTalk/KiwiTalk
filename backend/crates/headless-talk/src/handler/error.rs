use std::io;

use talk_loco_client::RequestError;
use thiserror::Error;

use crate::{ClientError, database::PoolTaskError};

#[derive(Debug, Error)]
#[error(transparent)]
pub enum HandlerError {
    Client(#[from] ClientError),

    Deserialize(#[from] bson::de::Error),

    Io(#[from] io::Error),
}

impl From<PoolTaskError> for HandlerError {
    fn from(value: PoolTaskError) -> Self {
        Self::Client(ClientError::Database(value))
    }
}

impl From<RequestError> for HandlerError {
    fn from(value: RequestError) -> Self {
        Self::Client(ClientError::Request(value))
    }
}
