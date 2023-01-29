pub mod user;

use rusqlite::{Connection, OptionalExtension, Row};

use crate::channel::{normal::NormalChannelData, ChannelId};

use self::user::NormalUserDatabaseExt;

use super::{ChannelDatabaseExt, ChannelModel};

#[derive(Debug, Clone, PartialEq)]
pub struct NormalChannelModel {
    pub id: ChannelId,
    pub joined_at_for_new_mem: i64,
}

impl NormalChannelModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            joined_at_for_new_mem: row.get(1)?,
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
                joined_at_for_new_mem: row.get(7)?,
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
            (model.id, model.joined_at_for_new_mem),
        )?;

        Ok(())
    }

    pub fn get(&self, id: ChannelId) -> Result<Option<NormalChannelModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM normal_channel WHERE id = ?",
                [id],
                NormalChannelModel::map_row,
            )
            .optional()
    }

    pub fn get_joined(
        &self,
        id: ChannelId,
    ) -> Result<Option<JoinedNormalChannelModel>, rusqlite::Error> {
        self.0.query_row(
            "SELECT channel.*, normal_channel.* FROM normal_channel INNER JOIN channel ON channel.id = normal_channel.id WHERE channel.id = ?",
            [id],
            JoinedNormalChannelModel::map_row
        ).optional()
    }

    pub fn get_all_channel(&self) -> Result<Vec<JoinedNormalChannelModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT channel.*, normal_channel.* FROM normal_channel INNER JOIN channel ON channel.id = normal_channel.id")?;

        let rows = statement.query(())?;
        rows.mapped(JoinedNormalChannelModel::map_row)
            .into_iter()
            .collect()
    }

    pub fn load_data(&self, id: ChannelId) -> Result<Option<NormalChannelData>, rusqlite::Error> {
        let common = self.0.channel().load_data(id)?;
        let common = match common {
            Some(common) => common,
            _ => return Ok(None),
        };

        let model = self.get(id)?;
        let model = match model {
            Some(model) => model,
            _ => return Ok(None),
        };

        Ok(Some(NormalChannelData {
            common,
            display_users: self.0.normal_user().get_display_users_in(id)?,
            joined_at_for_new_mem: model.joined_at_for_new_mem,
        }))
    }
}
