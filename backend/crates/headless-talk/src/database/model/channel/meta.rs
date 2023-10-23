use diesel::Insertable;

use crate::database::schema::channel_meta;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = channel_meta)]
pub struct ChannelMetaRow {
    pub channel_id: i64,

    #[diesel(column_name = "type_")]
    pub meta_type: i32,

    pub author_id: i64,

    pub revision: i64,

    pub content: String,

    pub updated_at: i64,
}
