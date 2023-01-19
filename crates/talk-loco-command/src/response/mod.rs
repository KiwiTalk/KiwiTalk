pub mod booking;
pub mod chat;
pub mod checkin;
pub mod media;

use serde::{Deserialize, Serialize};

/// Common Response data with status code
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ResponseData<T> {
    pub status: i16,

    #[serde(flatten)]
    pub data: Option<T>,
}
