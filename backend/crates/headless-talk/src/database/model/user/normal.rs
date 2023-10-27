use diesel::{prelude::Queryable, query_builder::AsChangeset, Insertable, Selectable};
use talk_loco_client::talk::session::channel::normal;

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

impl<'a> NormalChannelUserRow<'a> {
    pub fn from_user(channel_id: i64, user: &'a normal::user::User) -> Self {
        NormalChannelUserRow {
            id: user.user_id,
            channel_id,
            country_iso: user.country_iso.as_str(),
            account_id: user.account_id,
            status_message: user.status_message.as_str(),
            linked_services: user.linked_services.as_str(),
            suspended: user.suspended,
        }
    }
}

#[derive(Debug, AsChangeset, Clone, PartialEq, Eq)]
#[diesel(table_name = normal_channel_user)]
pub struct NormalChannelUserUpdate<'a> {
    pub country_iso: &'a str,

    pub account_id: i64,
    pub status_message: &'a str,
    pub linked_services: &'a str,

    pub suspended: bool,
}

impl<'a> From<&'a normal::user::User> for NormalChannelUserUpdate<'a> {
    fn from(user: &'a normal::user::User) -> Self {
        Self {
            country_iso: &user.country_iso,
            account_id: user.account_id,
            status_message: &user.status_message,
            linked_services: &user.linked_services,
            suspended: user.suspended,
        }
    }
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
