use talk_loco_command::command::codec::ReadError;
use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum ClientHandlerError {
    #[error("could not decode command {0}. {1}")]
    CommandDecode(String, bson::de::Error),

    #[error("network failure while reading. {0}")]
    NetworkRead(#[from] ReadError),

    #[error("database operation failed. {0}")]
    Database(#[from] PoolTaskError),
}
