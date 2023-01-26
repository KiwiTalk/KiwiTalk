pub mod user;

use rusqlite::{Connection, Row};

use crate::{channel::ChannelId, database::model::FullModel};

use super::ChannelModel;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NormalChannelModel {
    pub id: ChannelId,
    pub join_time: i64,
}

#[extend::ext(name = NormalChannelDatabaseExt)]
pub impl Connection {
    fn normal_channel(&self) -> NormalChannelEntry {
        NormalChannelEntry(self)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct NormalChannelEntry<'a>(pub &'a Connection);

impl NormalChannelEntry<'_> {
    pub fn insert(
        &self,
        channel: FullModel<ChannelId, NormalChannelModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO normal_channel VALUES (?, ?)",
            (channel.id, channel.model.join_time),
        )?;

        Ok(())
    }

    pub fn get_all_channel(&self) -> Result<Vec<ChannelModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT channel.* FROM channel INNER JOIN normal_channel ON channel.id = normal_channel.id")?;

        let rows = statement.query(())?;
        rows.mapped(ChannelModel::map_row).into_iter().collect()
    }

    pub fn map_row(row: &Row) -> Result<NormalChannelModel, rusqlite::Error> {
        Ok(NormalChannelModel {
            id: row.get(0)?,
            join_time: row.get(1)?,
        })
    }
}
