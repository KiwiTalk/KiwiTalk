use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayUser {
    pub user_id: i64,

    pub nickname: String,

    pub profile_image_url: Option<String>,

    pub country_iso: Option<String>,
}