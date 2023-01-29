pub mod normal;
pub mod open;
pub mod user;

use nohash_hasher::IntMap;
use rusqlite::{Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use talk_loco_command::structs::channel_info::ChannelListData;

use crate::{
    channel::{ChannelData, ChannelId, ChannelMeta, ChannelSettings},
    chat::LogId,
};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChannelTrackingData {
    pub last_chat_log_id: LogId,
    pub last_seen_log_id: LogId,
    pub last_update: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChannelModel {
    pub id: ChannelId,
    pub channel_type: String,

    pub tracking_data: ChannelTrackingData,

    pub settings: ChannelSettings,
}

impl ChannelModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            channel_type: row.get(1)?,

            tracking_data: ChannelTrackingData {
                last_chat_log_id: row.get(2)?,
                last_seen_log_id: row.get(3)?,
                last_update: row.get(4)?,
            },

            settings: ChannelSettings {
                push_alert: row.get(5)?,
            },
        })
    }
}

impl From<ChannelListData> for ChannelModel {
    fn from(data: ChannelListData) -> Self {
        let tracking_data = ChannelTrackingData {
            last_chat_log_id: data.last_log_id,
            last_seen_log_id: data.last_seen_log_id,
            last_update: data.last_update,
        };

        let settings = ChannelSettings {
            push_alert: data.push_alert,
        };

        Self {
            id: data.id,
            channel_type: data.channel_type,
            tracking_data,
            settings,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChannelMetaModel {
    pub channel_id: ChannelId,

    pub meta_type: i32,
    pub meta: ChannelMeta,
}

impl ChannelMetaModel {
    fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            channel_id: row.get(0)?,
            meta_type: row.get(1)?,
            meta: ChannelMeta {
                author_id: row.get(2)?,
                updated_at: row.get(3)?,
                revision: row.get(4)?,
                content: row.get(5)?,
            },
        })
    }
}

#[extend::ext(name = ChannelDatabaseExt)]
pub impl Connection {
    fn channel(&self) -> ChannelEntry {
        ChannelEntry(self)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChannelEntry<'a>(pub &'a Connection);

impl ChannelEntry<'_> {
    pub fn insert(&self, model: &ChannelModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel VALUES (?, ?, ?, ?, ?, ?)",
            (
                model.id,
                &model.channel_type,
                model.tracking_data.last_chat_log_id,
                model.tracking_data.last_seen_log_id,
                model.tracking_data.last_update,
                model.settings.push_alert,
            ),
        )?;

        Ok(())
    }

    pub fn get(&self, id: ChannelId) -> Result<Option<ChannelModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM channel WHERE id = ?",
                [id],
                ChannelModel::map_row,
            )
            .optional()
    }

    pub fn load_data(&self, id: ChannelId) -> Result<Option<ChannelData>, rusqlite::Error> {
        let model = self.get(id)?;
        let model = match model {
            Some(model) => model,
            _ => return Ok(None),
        };

        let metas = self.get_all_meta_in(id)?;

        Ok(Some(ChannelData {
            channel_type: model.channel_type,
            metas: metas
                .into_iter()
                .map(|model| (model.meta_type, model.meta))
                .collect(),
            settings: model.settings,
        }))
    }

    pub fn get_all_id(&self) -> Result<Vec<ChannelId>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT id FROM channel")?;

        let rows = statement.query(())?;
        rows.mapped(|row| row.get(0)).into_iter().collect()
    }

    pub fn get_all(&self) -> Result<Vec<ChannelModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM channel")?;

        let rows = statement.query(())?;
        rows.mapped(ChannelModel::map_row).into_iter().collect()
    }

    pub fn get_update_map(&self) -> Result<IntMap<ChannelId, i64>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT id, last_update FROM channel")?;

        let rows = statement.query(())?;

        rows.mapped(|row| Ok((row.get(0)?, row.get(1)?)))
            .into_iter()
            .collect()
    }

    pub fn get_last_update(&self, id: ChannelId) -> Result<Option<i64>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT last_update FROM channel WHERE id = ?",
                [id],
                |row| row.get(0),
            )
            .optional()
    }

    pub fn get_last_chat_log_id(&self, id: ChannelId) -> Result<Option<LogId>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT last_chat_log_id FROM channel WHERE id = ?",
                [id],
                |row| row.get(0),
            )
            .optional()
    }

    pub fn set_last_chat_log_id(
        &self,
        id: ChannelId,
        last_chat_log_id: LogId,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE channel SET last_chat_log_id = ? WHERE id = ?",
            (last_chat_log_id, id),
        )
    }

    pub fn set_last_seen_log_id(
        &self,
        id: ChannelId,
        last_seen_log_id: LogId,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE channel SET last_seen_log_id = ? WHERE id = ?",
            (last_seen_log_id, id),
        )
    }

    pub fn set_push_alert(
        &self,
        id: ChannelId,
        push_alert: bool,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE channel SET push_alert = ? WHERE id = ?",
            (push_alert, id),
        )
    }

    pub fn insert_meta(&self, model: &ChannelMetaModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel_meta VALUES (?, ?, ?, ?, ?, ?)",
            (
                model.channel_id,
                &model.meta_type,
                model.meta.author_id,
                model.meta.updated_at,
                model.meta.revision,
                &model.meta.content,
            ),
        )?;

        Ok(())
    }

    pub fn get_meta(
        &self,
        channel_id: ChannelId,
        meta_type: i32,
    ) -> Result<Option<ChannelMetaModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM channel_meta WHERE id = ? AND type = ?",
                (channel_id, meta_type),
                ChannelMetaModel::map_row,
            )
            .optional()
    }

    pub fn get_all_meta_in(
        &self,
        channel_id: ChannelId,
    ) -> Result<Vec<ChannelMetaModel>, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM channel_meta WHERE channel_id = ?")?;

        let rows = statement.query([channel_id])?;

        rows.mapped(ChannelMetaModel::map_row).into_iter().collect()
    }
}

#[cfg(test)]
pub(crate) mod tests {
    use std::error::Error;

    use rusqlite::Connection;

    use crate::{
        channel::{ChannelId, ChannelSettings},
        database::{
            channel::{ChannelModel, ChannelTrackingData},
            tests::prepare_test_database,
        },
    };

    use super::ChannelDatabaseExt;

    pub fn add_test_channel(
        db: &Connection,
        id: ChannelId,
    ) -> Result<ChannelModel, rusqlite::Error> {
        let model = ChannelModel {
            id,
            channel_type: "OM".into(),
            tracking_data: ChannelTrackingData {
                last_chat_log_id: 0,
                last_seen_log_id: 0,
                last_update: 0,
            },
            settings: ChannelSettings { push_alert: true },
        };

        db.channel().insert(&model)?;

        Ok(model)
    }

    #[test]
    fn channel_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;

        let model = add_test_channel(&db, 0)?;

        assert_eq!(model, db.channel().get(0)?.unwrap());

        Ok(())
    }
}
