use serde::{Deserialize, Serialize};

pub type UserId = i64;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayUser {
    pub id: UserId,

    pub nickname: String,

    pub profile_image_url: Option<String>,

    pub country_iso: Option<String>,
}
