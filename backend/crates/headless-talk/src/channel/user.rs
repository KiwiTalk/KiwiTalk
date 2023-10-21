use serde::{Deserialize, Serialize};
use talk_loco_client::talk::session::channel::{normal, open};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayUser {
    pub id: i64,
    pub profile: DisplayUserProfile,
}

impl From<open::user::DisplayUser> for DisplayUser {
    fn from(info: open::user::DisplayUser) -> Self {
        Self {
            id: info.user_id,
            profile: DisplayUserProfile {
                nickname: info.nickname,
                image_url: info.profile_image_url,
                country_iso: None,
            },
        }
    }
}

impl From<normal::user::DisplayUser> for DisplayUser {
    fn from(info: normal::user::DisplayUser) -> Self {
        Self {
            id: info.user_id,
            profile: DisplayUserProfile {
                nickname: info.nickname,
                image_url: info.profile_image_url,
                country_iso: Some(info.country_iso),
            },
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct UserProfile {
    pub nickname: String,

    pub image_url: Option<String>,
    pub full_image_url: Option<String>,
    pub original_image_url: Option<String>,
}

impl From<DisplayUserProfile> for UserProfile {
    fn from(profile: DisplayUserProfile) -> Self {
        Self {
            nickname: profile.nickname,
            image_url: profile.image_url,
            full_image_url: None,
            original_image_url: None,
        }
    }
}

impl From<normal::user::User> for UserProfile {
    fn from(value: normal::user::User) -> Self {
        Self {
            nickname: value.nickname,
            image_url: value.profile_image_url,
            full_image_url: value.full_profile_image_url,
            original_image_url: value.original_profile_image_url,
        }
    }
}

impl From<open::user::User> for UserProfile {
    fn from(value: open::user::User) -> Self {
        Self {
            nickname: value.nickname,
            image_url: value.profile_image_url,
            full_image_url: value.full_profile_image_url,
            original_image_url: value.original_profile_image_url,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Default, Clone, PartialEq, Eq)]
pub struct DisplayUserProfile {
    pub nickname: String,
    pub image_url: Option<String>,
    pub country_iso: Option<String>,
}

impl From<UserProfile> for DisplayUserProfile {
    fn from(profile: UserProfile) -> Self {
        Self {
            nickname: profile.nickname,
            image_url: profile.image_url,
            country_iso: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct UserData<Info> {
    pub id: i64,
    pub user_type: i32,
    pub profile: UserProfile,
    pub info: Info,
}
