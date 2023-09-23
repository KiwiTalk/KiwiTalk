use std::io;

use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum HandlerError {
    #[error(transparent)]
    CommandDecode(#[from] bson::de::Error),

    #[error(transparent)]
    Read(#[from] io::Error),

    #[error(transparent)]
    Database(#[from] PoolTaskError),
}
