use std::io;

use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum ClientHandlerError {
    #[error(transparent)]
    CommandDecode(#[from] bson::de::Error),

    #[error("network failure while reading. {0}")]
    Read(#[from] io::Error),

    #[error("database operation failed. {0}")]
    Database(#[from] PoolTaskError),
}
