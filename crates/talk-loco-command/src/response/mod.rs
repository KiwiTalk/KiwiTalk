pub mod booking;
pub mod chat;
pub mod checkin;
pub mod media;

use bson::Document;
use serde::{de::DeserializeOwned, Deserialize, Serialize};

/// Common Response data with status code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseData {
    pub status: i16,

    #[serde(flatten)]
    pub data: Document,
}

impl ResponseData {
    #[inline(always)]
    pub const fn new(status: i16, data: Document) -> Self {
        Self { status, data }
    }

    #[inline(always)]
    pub fn get<T: DeserializeOwned>(self) -> Result<T, bson::de::Error> {
        bson::from_document(self.data)
    }
}
