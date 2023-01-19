use talk_loco_command::command::codec::ReadError;
use thiserror::Error;

use crate::database::ConnectionManagerError;

#[derive(Debug, Error)]
pub enum KiwiTalkClientHandlerError {
    #[error("Could not decode command. command: {0}")]
    CommandDecode(String),

    #[error("Network error while reading from socket. {0}")]
    NetworkRead(#[from] ReadError),

    #[error("Database error. {0}")]
    Database(#[from] ConnectionManagerError),
}
