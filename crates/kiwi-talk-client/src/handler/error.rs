use talk_loco_command::command::codec::ReadError;
use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum ClientHandlerError {
    #[error("Could not decode command {0}. {1}")]
    CommandDecode(String, bson::de::Error),

    #[error("Network failure while reading. {0}")]
    NetworkRead(#[from] ReadError),

    #[error("Database operation failed. {0}")]
    Database(#[from] PoolTaskError),
}
