use talk_loco_client::talk::session::load_channel_list::response::ChannelListData as LocoChannelListData;

use crate::{
    database::{
        channel::{ChannelDatabaseExt, ChannelUpdateRow},
        pool::PoolTaskError,
    },
    KiwiTalkSession,
};

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
    ) -> Result<(), PoolTaskError> {
        self.0
            .pool
            .spawn_task(|mut conn| {
                let transaction = conn.transaction()?;

                for list_data in iter {
                    transaction.channel().insert_or_replace(&ChannelUpdateRow {
                        id: list_data.id,
                        channel_type: list_data.channel_type,
                        last_seen_log_id: list_data.last_seen_log_id,
                        last_update: list_data.last_update,
                    })?;
                }

                transaction.commit()?;

                Ok(())
            })
            .await
    }
}
