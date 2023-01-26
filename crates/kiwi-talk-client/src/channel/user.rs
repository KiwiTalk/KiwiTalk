use serde::{Deserialize, Serialize};

pub type UserId = i64;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayUser {
    pub id: UserId,

    pub nickname: String,

    pub profile_image_url: Option<String>,

    pub country_iso: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default, PartialEq)]
pub struct UserData {
    pub user_type: i32,

    pub nickname: String,
    pub profile: UserProfile,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default, PartialEq, Eq)]
pub struct UserProfile {
    pub image_url: Option<String>,
    pub full_image_url: Option<String>,
    pub original_image_url: Option<String>,
}
