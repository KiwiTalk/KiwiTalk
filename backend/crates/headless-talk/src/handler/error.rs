use thiserror::Error;

use crate::database::pool::PoolTaskError;

#[derive(Debug, Error)]
pub enum HandlerError {
    #[error(transparent)]
    Database(#[from] PoolTaskError),
}
