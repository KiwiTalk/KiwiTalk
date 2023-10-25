use std::io;

use thiserror::Error;

use crate::database::PoolTaskError;

#[derive(Debug, Error)]
#[error(transparent)]
pub enum HandlerError {
    Database(#[from] PoolTaskError),

    Deserialize(#[from] bson::de::Error),

    Io(#[from] io::Error),
}
