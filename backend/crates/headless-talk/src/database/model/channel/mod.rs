pub mod meta;

use diesel::Insertable;

use crate::database::schema::channel_list;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = channel_list)]
pub struct ChannelListRow<'a> {
    pub id: i64,

    #[diesel(column_name = "type_")]
    pub channel_type: &'a str,

    pub display_users: &'a str,

    pub last_seen_log_id: Option<i64>,

    pub last_update: i64,
}
