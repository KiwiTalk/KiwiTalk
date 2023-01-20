pub mod model;

pub mod normal;
pub mod open;

use rusqlite::{Connection, Row};

use crate::{chat::model::LogId, model::FullModel};

use self::model::{ChannelId, ChannelModel, ChannelUserId, ChannelUserModel};

#[derive(Debug, Clone, Copy)]
pub struct ChannelEntry<'a>(pub &'a Connection);

impl<'a> ChannelEntry<'a> {
    pub fn insert(
        &self,
        channel: &FullModel<ChannelId, ChannelModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            (
                &channel.id,
                &channel.model.channel_type,
                &channel.model.active_user_count,
                &channel.model.new_chat_count,
                &channel.model.last_chat_log_id,
                &channel.model.last_seen_log_id,
                &channel.model.push_alert,
            ),
        )?;

        Ok(())
    }

    pub fn get(&self, id: ChannelId) -> Result<ChannelModel, rusqlite::Error> {
        self.0
            .query_row("SELECT * FROM channel WHERE id = ?", [id], Self::map_row)
    }

    pub fn get_all_channels(
        &self,
    ) -> Result<Vec<FullModel<ChannelId, ChannelModel>>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM channel")?;

        let rows = statement.query(())?;
        rows.mapped(Self::map_full_row).into_iter().collect()
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

    pub fn map_row(row: &Row) -> Result<ChannelModel, rusqlite::Error> {
        Ok(ChannelModel {
            channel_type: row.get(1)?,
            active_user_count: row.get(2)?,
            new_chat_count: row.get(3)?,
            last_chat_log_id: row.get(4)?,
            last_seen_log_id: row.get(5)?,
            push_alert: row.get(6)?,
        })
    }

    pub fn map_full_row(row: &Row) -> Result<FullModel<ChannelId, ChannelModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get(0)?,
            model: Self::map_row(row)?,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChannelUserEntry<'a>(pub &'a Connection);

impl<'a> ChannelUserEntry<'a> {
    pub fn insert(
        &self,
        user: &FullModel<ChannelUserId, ChannelUserModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel_user VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            (
                &user.id,
                &user.model.channel_id,
                &user.model.nickname,
                &user.model.profile_url,
                &user.model.full_profile_url,
                &user.model.original_profile_url,
                &user.model.user_type,
                &user.model.watermark,
            ),
        )?;

        Ok(())
    }

    pub fn get(
        &self,
        id: ChannelUserId,
        channel_id: ChannelId,
    ) -> Result<ChannelUserModel, rusqlite::Error> {
        self.0.query_row(
            "SELECT * FROM channel_user WHERE id = ? AND channel_id = ?",
            (id, channel_id),
            Self::map_row,
        )
    }

    pub fn get_all(&self, id: ChannelUserId) -> Result<Vec<ChannelUserModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM channel_user WHERE id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(Self::map_row).collect()
    }

    pub fn get_all_users_in(
        &self,
        id: ChannelId,
    ) -> Result<Vec<FullModel<ChannelUserId, ChannelUserModel>>, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM channel_user WHERE channel_id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(Self::map_full_row).collect()
    }

    pub fn update_watermark(
        &self,
        id: ChannelUserId,
        channel_id: ChannelId,
        watermark: LogId,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE channel_user SET watermark = ? WHERE id = ? AND channel_id = ?",
            (watermark, id, channel_id),
        )
    }

    pub fn map_row(row: &Row) -> Result<ChannelUserModel, rusqlite::Error> {
        Ok(ChannelUserModel {
            channel_id: row.get(1)?,
            nickname: row.get(2)?,
            profile_url: row.get(3)?,
            full_profile_url: row.get(4)?,
            original_profile_url: row.get(5)?,
            user_type: row.get(6)?,
            watermark: row.get(7)?,
        })
    }

    pub fn map_full_row(
        row: &Row,
    ) -> Result<FullModel<ChannelUserId, ChannelUserModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get(0)?,
            model: Self::map_row(row)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use std::error::Error;

    use crate::{
        channel::model::{ChannelModel, ChannelUserModel},
        model::FullModel,
        tests::prepare_test_database,
    };

    #[test]
    fn channel_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;

        let model = ChannelModel {
            channel_type: "OM".into(),
            active_user_count: 0,
            new_chat_count: 0,
            last_chat_log_id: 0,
            last_seen_log_id: 0,
            push_alert: true,
        };

        db.channel().insert(&FullModel::new(0, model.clone()))?;

        assert_eq!(model, db.channel().get(0)?);

        Ok(())
    }

    #[test]
    fn channel_user_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;
        db.channel().insert(&FullModel::new(
            0,
            ChannelModel {
                channel_type: "OM".into(),
                active_user_count: 0,
                new_chat_count: 0,
                last_chat_log_id: 0,
                last_seen_log_id: 0,
                push_alert: true,
            },
        ))?;

        let model = ChannelUserModel {
            channel_id: 0,
            nickname: "".into(),
            profile_url: None,
            full_profile_url: None,
            original_profile_url: None,
            user_type: 0,
            watermark: 0,
        };

        db.user().insert(&FullModel::new(0, model.clone()))?;

        assert_eq!(model, db.user().get(0, 0)?);

        Ok(())
    }
}
