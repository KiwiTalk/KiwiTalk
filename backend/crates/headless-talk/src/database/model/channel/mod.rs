pub mod meta;
pub mod normal;

use diesel::{prelude::Queryable, Insertable};

use crate::database::schema::channel_list;

#[derive(Debug, Insertable, Queryable, Clone, PartialEq, Eq)]
#[diesel(table_name = channel_list)]
pub struct ChannelListRow {
    pub id: i64,

    #[diesel(column_name = "type_")]
    pub channel_type: String,

    pub display_users: String,

    pub active_user_count: i32,
    pub unread_count: i32,

    pub last_seen_log_id: Option<i64>,

    pub last_update: i64,
}
