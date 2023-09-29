/*
pub mod normal;
pub mod open;
*/
pub mod user;

use rusqlite::{Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};

use crate::{
    channel::{ChannelId, ChannelMeta},
    chat::LogId,
};
use talk_loco_client::talk::session::load_channel_list::response::ChannelListData as LocoChanneListData;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChannelUpdateRow {
    pub id: ChannelId,
    pub channel_type: String,

    pub last_seen_log_id: LogId,
    pub last_update: i64,
}

impl ChannelUpdateRow {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            channel_type: row.get(1)?,

            last_seen_log_id: row.get(2)?,
            last_update: row.get(3)?,
        })
    }
}

impl From<LocoChanneListData> for ChannelUpdateRow {
    fn from(data: LocoChanneListData) -> Self {
        Self {
            id: data.id,
            channel_type: data.channel_type,
            last_seen_log_id: data.last_seen_log_id,
            last_update: data.last_update,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChannelMetaRow {
    pub channel_id: ChannelId,

    pub meta_type: i32,
    pub meta: ChannelMeta,
}

impl ChannelMetaRow {
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
    pub fn insert_or_replace(self, row: &ChannelUpdateRow) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel_update VALUES (?, ?, ?, ?)",
            (
                row.id,
                &row.channel_type,
                row.last_seen_log_id,
                row.last_update,
            ),
        )?;

        Ok(())
    }

    pub fn get(self, id: ChannelId) -> Result<Option<ChannelUpdateRow>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM channel_update WHERE id = ?",
                [id],
                ChannelUpdateRow::map_row,
            )
            .optional()
    }

    pub fn get_all_id<B: FromIterator<ChannelId>>(self) -> Result<B, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT id FROM channel_update")?;

        let rows = statement.query(())?;
        rows.mapped(|row| row.get(0)).collect()
    }

    pub fn get_all<B: FromIterator<ChannelUpdateRow>>(self) -> Result<B, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM channel_update")?;

        let rows = statement.query(())?;
        rows.mapped(ChannelUpdateRow::map_row).collect()
    }

    pub fn get_last_update(self, id: ChannelId) -> Result<Option<i64>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT last_update FROM channel_update WHERE id = ?",
                [id],
                |row| row.get(0),
            )
            .optional()
    }

    pub fn set_last_seen_log_id(
        self,
        id: ChannelId,
        last_seen_log_id: LogId,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE channel_update SET last_seen_log_id = ? WHERE id = ?",
            (last_seen_log_id, id),
        )
    }

    pub fn insert_or_replace_meta(self, row: &ChannelMetaRow) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel_meta VALUES (?, ?, ?, ?, ?, ?)",
            (
                row.channel_id,
                &row.meta_type,
                row.meta.author_id,
                row.meta.updated_at,
                row.meta.revision,
                &row.meta.content,
            ),
        )?;

        Ok(())
    }

    pub fn get_meta(
        self,
        channel_id: ChannelId,
        meta_type: i32,
    ) -> Result<Option<ChannelMeta>, rusqlite::Error> {
        Ok(self
            .0
            .query_row(
                "SELECT * FROM channel_meta WHERE id = ? AND type = ?",
                (channel_id, meta_type),
                ChannelMetaRow::map_row,
            )
            .optional()?
            .map(|row| row.meta))
    }

    pub fn get_all_meta_in<B: FromIterator<(i32, ChannelMeta)>>(
        self,
        channel_id: ChannelId,
    ) -> Result<B, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM channel_meta WHERE channel_id = ?")?;

        let rows = statement.query([channel_id])?;

        rows.mapped(|row| {
            let row = ChannelMetaRow::map_row(row)?;

            Ok((row.meta_type, row.meta))
        })
        .collect()
    }
}

#[cfg(test)]
pub(crate) mod tests {
    use std::error::Error;

    use rusqlite::Connection;

    use crate::{
        channel::ChannelId,
        database::{channel::ChannelUpdateRow, tests::prepare_test_database},
    };

    use super::ChannelDatabaseExt;

    pub fn add_test_channel(
        db: &Connection,
        id: ChannelId,
    ) -> Result<ChannelUpdateRow, rusqlite::Error> {
        let row = ChannelUpdateRow {
            id,
            channel_type: "OM".into(),
            last_seen_log_id: 0,
            last_update: 0,
        };

        db.channel().insert_or_replace(&row)?;

        Ok(row)
    }

    #[test]
    fn channel_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;

        let row = add_test_channel(&db, 0)?;

        assert_eq!(row, db.channel().get(0)?.unwrap());

        Ok(())
    }
}
