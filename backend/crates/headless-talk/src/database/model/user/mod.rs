pub mod normal;

use diesel::{prelude::Queryable, Insertable, Selectable};

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
