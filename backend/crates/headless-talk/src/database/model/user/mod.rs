pub mod normal;

use diesel::{prelude::Queryable, Insertable, Selectable, query_builder::AsChangeset};
use talk_loco_client::talk::session;

use crate::database::schema::user_profile;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = user_profile)]
pub struct UserProfileRow<'a> {
    pub id: i64,
    pub channel_id: i64,

    pub nickname: &'a str,

    pub profile_url: &'a str,
    pub full_profile_url: &'a str,
    pub original_profile_url: &'a str,
}

impl<'a> UserProfileRow<'a> {
    pub fn from_normal_user(
        channel_id: i64,
        user: &'a session::channel::normal::user::User,
    ) -> Self {
        Self {
            id: user.user_id,
            channel_id,
            nickname: user.nickname.as_str(),
            profile_url: user.profile_image_url.as_str(),
            full_profile_url: user.full_profile_image_url.as_str(),
            original_profile_url: user.original_profile_image_url.as_str(),
        }
    }
}

#[derive(Debug, AsChangeset, Clone, PartialEq, Eq)]
#[diesel(table_name = user_profile)]
pub struct UserProfileUpdate<'a> {
    pub nickname: &'a str,

    pub profile_url: &'a str,
    pub full_profile_url: &'a str,
    pub original_profile_url: &'a str,
}


#[derive(Debug, Queryable, Selectable, Clone, PartialEq, Eq)]
#[diesel(table_name = user_profile)]
pub struct UserProfileModel {
    pub id: i64,

    pub nickname: String,

    pub profile_url: String,
    pub full_profile_url: String,
    pub original_profile_url: String,

    pub watermark: Option<i64>,
}
