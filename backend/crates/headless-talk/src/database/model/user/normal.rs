use diesel::{prelude::Queryable, Insertable, Selectable};

use crate::database::schema::normal_channel_user;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = normal_channel_user)]
pub struct NormalChannelUserRow<'a> {
    pub id: i64,
    pub channel_id: i64,

    pub country_iso: &'a str,

    pub account_id: i64,
    pub status_message: &'a str,
    pub linked_services: &'a str,

    pub suspended: bool,
}

#[derive(Debug, Queryable, Selectable, Clone, PartialEq, Eq)]
#[diesel(table_name = normal_channel_user)]
pub struct NormalChannelUserModel {
    pub id: i64,

    pub country_iso: String,

    pub account_id: i64,
    pub status_message: String,
    pub linked_services: String,

    pub suspended: bool,
}
