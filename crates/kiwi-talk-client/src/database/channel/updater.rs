use rusqlite::Connection;
use talk_loco_client::talk::session::load_channel_list::response::ChannelListData as LocoChanneListData;

use crate::channel::ChannelId;

use super::{ChannelDatabaseExt, ChannelUpdateRow};

#[extend::ext(name = ChannelUpdaterExt)]
pub impl Connection {
    fn channel_updater(&self) -> ChannelUpdater {
        ChannelUpdater(self)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChannelUpdater<'a>(pub &'a Connection);

impl ChannelUpdater<'_> {
    pub fn update(self, list_data: LocoChanneListData) -> Result<(), rusqlite::Error> {
        self.0.channel().insert_or_replace(&ChannelUpdateRow {
            id: list_data.id,
            channel_type: list_data.channel_type,
            last_seen_log_id: list_data.last_seen_log_id,
            last_update: list_data.last_update,
        })?;

        Ok(())
    }

    pub fn get_update_map<B: FromIterator<(ChannelId, i64)>>(self) -> Result<B, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT id, last_update FROM channel")?;

        let rows = statement.query(())?;

        rows.mapped(|row| Ok((row.get(0)?, row.get(1)?))).collect()
    }
}
