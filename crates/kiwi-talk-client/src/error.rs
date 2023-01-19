use talk_loco_client::client::ClientRequestError;
use thiserror::Error;

use crate::database::KiwiTalkDatabaseError;

#[derive(Debug, Error)]
pub enum KiwiTalkClientError {
    #[error("Request failed. {0}")]
    Request(#[from] ClientRequestError),

    #[error("Database operation failed. {0}")]
    Database(#[from] KiwiTalkDatabaseError),
}