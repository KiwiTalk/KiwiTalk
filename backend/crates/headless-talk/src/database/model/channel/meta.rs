use diesel::Insertable;
use talk_loco_client::talk::{channel::ChannelMeta, stream::command::ChgMeta};

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

impl ChannelMetaRow {
    pub fn from_meta(channel_id: i64, meta: ChannelMeta) -> Self {
        Self {
            channel_id,
            meta_type: meta.meta_type,
            author_id: meta.author_id,
            revision: meta.revision,
            content: meta.content,
            updated_at: meta.updated_at,
        }
    }
}

impl From<ChgMeta> for ChannelMetaRow {
    fn from(value: ChgMeta) -> Self {
        Self::from_meta(value.chat_id, value.meta)
    }
}
