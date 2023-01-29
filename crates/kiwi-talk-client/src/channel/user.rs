use serde::{Deserialize, Serialize};
use talk_loco_command::structs::user::DisplayUserInfo;

pub type UserId = i64;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayUser {
    pub id: UserId,

    pub profile: UserProfile,

    pub country_iso: Option<String>,
}

impl From<DisplayUserInfo> for DisplayUser {
    fn from(info: DisplayUserInfo) -> Self {
        Self {
            id: info.user_id,
            profile: UserProfile {
                nickname: info.nickname,
                image: UserProfileImage {
                    image_url: info.profile_image_url,
                    ..Default::default()
                },
            },
            country_iso: info.country_iso,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct UserProfile {
    pub nickname: String,
    pub image: UserProfileImage,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct UserData<Info> {
    pub id: UserId,
    pub user_type: i32,
    pub profile: UserProfile,
    pub info: Info,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default, PartialEq, Eq)]
pub struct UserProfileImage {
    pub image_url: Option<String>,
    pub full_image_url: Option<String>,
    pub original_image_url: Option<String>,
}
