pub mod booking;
pub mod chat;
pub mod checkin;
pub mod media;

use bson::Document;
use serde::{de::DeserializeOwned, Deserialize, Serialize};

/// Common Response data with status code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseData {
    pub status: i32,

    #[serde(flatten)]
    pub data: Document,
}

impl ResponseData {
    #[inline(always)]
    pub const fn new(status: i32, data: Document) -> Self {
        Self { status, data }
    }

    #[inline(always)]
    pub fn get<T: DeserializeOwned>(self) -> Result<T, bson::de::Error> {
        bson::from_document(self.data)
    }

    pub fn from_document(mut doc: Document) -> Option<Self> {
        Some(Self {
            status: doc.remove("status")?.as_i32()?,
            data: doc,
        })
    }
}
