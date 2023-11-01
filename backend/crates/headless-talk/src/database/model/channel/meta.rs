use diesel::Insertable;
use talk_loco_client::talk::stream::command::ChgMeta;

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

impl From<ChgMeta> for ChannelMetaRow {
    fn from(value: ChgMeta) -> Self {
        Self {
            channel_id: value.chat_id,
            meta_type: value.meta.meta_type,
            author_id: value.meta.author_id,
            revision: value.meta.revision,
            content: value.meta.content,
            updated_at: value.meta.updated_at,
        }
    }
}
