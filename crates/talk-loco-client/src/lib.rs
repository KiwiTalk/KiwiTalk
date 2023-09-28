pub mod client;
pub mod macros;
pub mod structs;
pub mod talk;

pub use futures_loco_protocol;
pub use futures_loco_protocol::loco_protocol;

use std::io;

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct BsonCommandStatus {
    pub status: i32,
}

pub type RequestResult<T> = Result<T, RequestError>;

#[derive(Debug, Error)]
pub enum RequestError {
    #[error("request returned status {0}")]
    Status(i32),

    #[error(transparent)]
    Serialize(#[from] bson::ser::Error),

    #[error(transparent)]
    Read(io::Error),

    #[error(transparent)]
    Write(io::Error),

    #[error(transparent)]
    Deserialize(#[from] bson::de::Error),
}

pub type StreamResult<T> = Result<T, StreamError>;

#[derive(Debug, Error)]
pub enum StreamError {
    #[error(transparent)]
    Io(#[from] io::Error),

    #[error(transparent)]
    Deserialize(#[from] bson::de::Error),
}
