use std::io;

use talk_loco_command::command::codec::ReadError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum KiwiTalkClientError {
    #[error("Could not decode command. command: {0}")]
    CommandDecode(String),

    #[error("Network error while reading from socket. {0}")]
    NetworkRead(#[from] ReadError),

    #[error("Client handler io error. {0}")]
    Io(#[from] io::Error),
}