use arrayvec::ArrayVec;
use diesel::{QueryDsl, RunQueryDsl};
use futures_loco_protocol::session::LocoSession;
use nohash_hasher::IntMap;
use talk_loco_client::talk::session::load_channel_list::ChannelListData;

use crate::{
    database::{
        model::{channel::ChannelListRow, chat::ChatRow},
        schema::{channel_list, chat},
        DatabasePool,
    },
    ClientResult,
};

use super::channel::ChannelInitializer;

#[derive(Debug, Clone, Copy)]
pub struct ChannelListUpdater<'a> {
    session: &'a LocoSession,
    pool: &'a DatabasePool,
}

impl<'a> ChannelListUpdater<'a> {
    pub fn new(session: &'a LocoSession, pool: &'a DatabasePool) -> Self {
        Self { session, pool }
    }

    pub async fn update(self, iter: impl IntoIterator<Item = ChannelListData>) -> ClientResult<()> {
        let update_map = self
            .pool
            .spawn(|conn| {
                Ok(IntMap::from_iter(
                    channel_list::table
                        .select((channel_list::id, channel_list::last_update))
                        .load::<(i64, i64)>(conn)?
                        .into_iter(),
                ))
            })
            .await?;

        let mut update_list = Vec::<ChannelListRow>::new();
        let mut chat_list = Vec::<ChatRow>::new();

        for list_data in iter {
            if update_map
                .get(&list_data.id)
                .map(|&last_update| last_update >= list_data.last_update)
                .unwrap_or(false)
            {
                continue;
            }

            let channel_type = if let Some(ty) = list_data.channel_type.ty() {
                ty
            } else {
                continue;
            };

            if ChannelInitializer::new(self.session, self.pool, list_data.id)
                .initialize()
                .await?
                .is_none()
            {
                continue;
            }

            let list_row = ChannelListRow {
                id: list_data.id,
                channel_type: channel_type.as_str().to_string(),

                display_users: {
                    let mut vec = ArrayVec::<_, 4>::new();

                    if let Some(ids) = list_data.icon_user_ids {
                        vec.extend(ids.into_iter().take(4));
                    }

                    serde_json::to_string(&vec).unwrap()
                },

                unread_count: list_data.unread_count,
                active_user_count: list_data.active_member_count,

                last_log_id: list_data.last_log_id,
                last_seen_log_id: list_data.last_seen_log_id,
                last_update: list_data.last_update,
            };

            if let Some(chatlog) = list_data.chatlog {
                chat_list.push(ChatRow::from_chatlog(chatlog, None));
            }

            update_list.push(list_row);
        }

        self.pool
            .spawn(move |conn| {
                diesel::replace_into(channel_list::table)
                    .values(update_list)
                    .execute(conn)?;

                diesel::insert_or_ignore_into(chat::table)
                    .values(chat_list)
                    .execute(conn)?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}
