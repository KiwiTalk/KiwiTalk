mod normal;

use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl, SqliteConnection};
use futures_loco_protocol::session::LocoSession;
use talk_loco_client::talk::{
    channel::ChannelType,
    session::{channel::info::ChannelInfoType, TalkSession},
};

use crate::{
    database::{
        model::channel::{meta::ChannelMetaRow, ChannelListRow},
        schema::{channel_list, channel_meta, chat, user_profile},
        DatabasePool, PoolTaskError,
    },
    ClientResult,
};

use self::normal::NormalChannelUpdater;

#[derive(Debug)]
pub struct ChannelUpdater {
    id: i64,
}

impl ChannelUpdater {
    pub fn new(id: i64) -> Self {
        Self { id }
    }

    pub async fn update(
        self,
        session: &LocoSession,
        pool: &DatabasePool,
    ) -> ClientResult<Option<()>> {
        let res = TalkSession(session).channel(self.id).info().await?;

        let meta_rows = res
            .channel_metas
            .into_iter()
            .map(|meta| ChannelMetaRow {
                channel_id: self.id,
                meta_type: meta.meta_type,
                author_id: meta.author_id,
                revision: meta.revision,
                content: meta.content,
                updated_at: meta.updated_at,
            })
            .collect::<Vec<_>>();

        match res.channel_type {
            ChannelInfoType::DirectChat(normal)
            | ChannelInfoType::MultiChat(normal)
            | ChannelInfoType::MemoChat(normal) => {
                NormalChannelUpdater::new(self.id)
                    .update(session, pool, normal, move |conn| {
                        diesel::replace_into(channel_meta::table)
                            .values(meta_rows)
                            .execute(conn)?;

                        Ok(())
                    })
                    .await?;

                return Ok(Some(()));
            }

            _ => {}
        }

        Ok(Some(()))
    }

    pub fn remove(self, conn: &mut SqliteConnection) -> Result<Option<()>, PoolTaskError> {
        let row: ChannelListRow = channel_list::table
            .select(channel_list::all_columns)
            .filter(channel_list::id.eq(self.id))
            .first::<ChannelListRow>(conn)?;

        let ty = ChannelType::from(row.channel_type.as_str());

        match ty {
            ChannelType::DirectChat | ChannelType::MultiChat | ChannelType::MemoChat => {
                NormalChannelUpdater::new(self.id).remove(conn)?;
            }

            _ => return Ok(None),
        }

        diesel::delete(chat::table.filter(chat::channel_id.eq(self.id))).execute(conn)?;

        diesel::delete(channel_meta::table.filter(channel_meta::channel_id.eq(self.id)))
            .execute(conn)?;

        diesel::delete(user_profile::table.filter(user_profile::channel_id.eq(self.id)))
            .execute(conn)?;

        diesel::delete(channel_list::table.filter(channel_list::id.eq(self.id))).execute(conn)?;

        Ok(Some(()))
    }
}
