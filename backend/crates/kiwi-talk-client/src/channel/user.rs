use serde::{Deserialize, Serialize};
use talk_loco_client::structs::{
    openlink::OpenUser as LocoOpenUser,
    user::{DisplayUserInfo, User as LocoNormalUser, UserVariant as LocoUserVariant},
};

pub type UserId = i64;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayUser {
    pub id: UserId,
    pub profile: DisplayUserProfile,
}

impl From<DisplayUserInfo> for DisplayUser {
    fn from(info: DisplayUserInfo) -> Self {
        Self {
            id: info.user_id,
            profile: DisplayUserProfile {
                nickname: info.nickname,
                image_url: info.profile_image_url,
                country_iso: info.country_iso,
            },
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Default, Clone, PartialEq, Eq)]
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

impl From<LocoUserVariant> for UserProfile {
    fn from(value: LocoUserVariant) -> Self {
        match value {
            LocoUserVariant::Normal(normal) => UserProfile::from(normal),
            LocoUserVariant::Open(open) => UserProfile::from(open),
        }
    }
}

impl From<LocoNormalUser> for UserProfile {
    fn from(value: LocoNormalUser) -> Self {
        Self {
            nickname: value.nickname,
            image_url: value.profile_image_url,
            full_image_url: value.full_profile_image_url,
            original_image_url: value.original_profile_image_url,
        }
    }
}

impl From<LocoOpenUser> for UserProfile {
    fn from(value: LocoOpenUser) -> Self {
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
    pub id: UserId,
    pub user_type: i32,
    pub profile: UserProfile,
    pub info: Info,
}
