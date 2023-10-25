use crate::{
    database::model::user::{normal::NormalChannelUserModel, UserProfileModel},
    user::UserProfile,
};

#[derive(Debug, Clone)]
pub struct NormalChannelUser {
    pub country_iso: String,

    pub account_id: i64,
    pub status_message: String,
    pub linked_services: String,

    pub suspended: bool,

    pub watermark: i64,

    pub profile: UserProfile,
}

impl NormalChannelUser {
    pub(super) fn from_models(profile: UserProfileModel, user: NormalChannelUserModel) -> Self {
        Self {
            country_iso: user.country_iso,
            account_id: user.account_id,
            status_message: user.status_message,
            linked_services: user.linked_services,
            suspended: user.suspended,
            watermark: profile.watermark.unwrap_or(0),
            profile: UserProfile::from(profile),
        }
    }
}
