use talk_loco_client::RequestError;
use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum ClientError {
    #[error(transparent)]
    Request(#[from] RequestError),

    #[error(transparent)]
    Database(#[from] PoolTaskError),
}
