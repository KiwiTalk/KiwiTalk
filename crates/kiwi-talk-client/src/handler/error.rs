use talk_loco_command::command::codec::ReadError;
use thiserror::Error;

use crate::database::KiwiTalkDatabaseError;

#[derive(Debug, Error)]
pub enum KiwiTalkClientHandlerError {
    #[error("Could not decode command {0}. {1}")]
    CommandDecode(String, bson::de::Error),

    #[error("Network failure while reading. {0}")]
    NetworkRead(#[from] ReadError),

    #[error("Database operation failed. {0}")]
    Database(#[from] KiwiTalkDatabaseError),
}
