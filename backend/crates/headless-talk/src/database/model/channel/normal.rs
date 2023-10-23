use diesel::Insertable;

use crate::database::schema::normal_channel;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = normal_channel)]
pub struct NormalChannelRow {
    pub id: i64,
    pub joined_at_for_new_mem: Option<i64>,
    pub inviter_user_id: Option<i64>,
}
