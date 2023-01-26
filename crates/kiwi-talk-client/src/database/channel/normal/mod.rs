pub mod user;

use rusqlite::{Connection, OptionalExtension, Row};

use crate::channel::ChannelId;

use super::ChannelModel;

#[derive(Debug, Clone, PartialEq)]
pub struct NormalChannelModel {
    pub id: ChannelId,
    pub join_time: i64,
}

impl NormalChannelModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            join_time: row.get(1)?,
        })
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct JoinedNormalChannelModel {
    pub model: ChannelModel,
    pub normal: NormalChannelModel,
}

impl JoinedNormalChannelModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            model: ChannelModel::map_row(row)?,
            normal: NormalChannelModel {
                id: row.get(6)?,
                join_time: row.get(7)?,
            },
        })
    }
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
    pub fn insert(&self, model: &NormalChannelModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO normal_channel VALUES (?, ?)",
            (model.id, model.join_time),
        )?;

        Ok(())
    }

    pub fn get_joined(
        &self,
        id: ChannelId,
    ) -> Result<Option<JoinedNormalChannelModel>, rusqlite::Error> {
        self.0.query_row(
            "SELECT channel.*, normal_channel.* FROM channel INNER JOIN normal_channel ON channel.id = normal_channel.id WHERE channel.id = ?",
            [id],
            JoinedNormalChannelModel::map_row
        ).optional()
    }

    pub fn get_all_channel(&self) -> Result<Vec<JoinedNormalChannelModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT channel.*, normal_channel.* FROM channel INNER JOIN normal_channel ON channel.id = normal_channel.id")?;

        let rows = statement.query(())?;
        rows.mapped(JoinedNormalChannelModel::map_row)
            .into_iter()
            .collect()
    }
}
