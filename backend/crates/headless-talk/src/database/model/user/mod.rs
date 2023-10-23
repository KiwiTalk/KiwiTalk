use diesel::Insertable;

use crate::database::schema::user_profile;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = user_profile)]
pub struct UserProfileRow<'a> {
    pub id: i64,
    pub channel_id: i64,

    pub nickname: &'a str,

    pub profile_url: Option<&'a str>,
    pub full_profile_url: Option<&'a str>,
    pub original_profile_url: Option<&'a str>,

    pub watermark: Option<i64>,
}
