use nohash_hasher::IntMap;
use talk_loco_client::talk::session::load_channel_list::response::ChannelListData as LocoChannelListData;
use thiserror::Error;

use crate::{
    database::{
        channel::{ChannelDatabaseExt, ChannelUpdateRow},
        pool::PoolTaskError,
    },
    KiwiTalkSession,
};

use super::ChannelId;

#[derive(Debug, Clone, Copy)]
pub struct ChannelUpdater<'a>(&'a KiwiTalkSession);

impl<'a> ChannelUpdater<'a> {
    pub(crate) fn new(session: &'a KiwiTalkSession) -> Self {
        Self(session)
    }
}

impl ChannelUpdater<'_> {
    pub async fn update(
        self,
        iter: impl IntoIterator<Item = LocoChannelListData> + Send + 'static,
    ) -> Result<(), UpdateError> {
        let update_map: IntMap<ChannelId, i64> = self
            .0
            .pool
            .spawn_task(|conn| Ok(conn.channel().get_update_map()?))
            .await?;

        let mut row_list = Vec::new();
        for list_data in iter {
            if update_map
                .get(&list_data.id)
                .map(|&last_update| last_update >= list_data.last_update)
                .unwrap_or(false)
            {
                continue;
            }

            // TODO:: add user update

            row_list.push(ChannelUpdateRow {
                id: list_data.id,
                channel_type: list_data.channel_type,
                last_seen_log_id: list_data.last_seen_log_id,
                last_update: list_data.last_update,
            });
        }

        self.0
            .pool
            .spawn_task(|mut conn| {
                let transaction = conn.transaction()?;

                for row in row_list {
                    transaction.channel().insert_or_replace(&row)?;
                }

                transaction.commit()?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}

#[derive(Debug, Error)]
pub enum UpdateError {
    #[error(transparent)]
    Pool(#[from] PoolTaskError),
}
