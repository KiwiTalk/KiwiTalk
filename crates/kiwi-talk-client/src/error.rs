use talk_loco_client::RequestError;
use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum KiwiTalkClientError {
    #[error("request failed. {0}")]
    Request(#[from] RequestError),

    #[error("database operation failed. {0}")]
    Database(#[from] PoolTaskError),
}
