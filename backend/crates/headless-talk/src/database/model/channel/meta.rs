use diesel::{prelude::Queryable, Insertable};
use talk_loco_client::talk::{channel::ChannelMeta, stream::command::ChgMeta};

use crate::database::schema::channel_meta;

#[derive(Debug, Insertable, Queryable, Clone, PartialEq, Eq)]
#[diesel(table_name = channel_meta)]
pub struct ChannelMetaRow {
    pub channel_id: i64,

    #[diesel(column_name = "type_")]
    pub meta_type: i32,

    pub author_id: i64,
    pub updated_at: i64,
    pub revision: i64,

    pub content: String,
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

impl Into<ChannelMeta> for ChannelMetaRow {
    fn into(self) -> ChannelMeta {
        ChannelMeta {
            meta_type: self.meta_type,
            revision: self.revision,
            author_id: self.author_id,
            updated_at: self.updated_at,
            content: self.content,
        }
    }
}
