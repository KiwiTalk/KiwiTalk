use talk_loco_client::client::ClientRequestError;
use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum KiwiTalkClientError {
    #[error("request failed. {0}")]
    Request(#[from] ClientRequestError),

    #[error("database operation failed. {0}")]
    Database(#[from] PoolTaskError),
}
