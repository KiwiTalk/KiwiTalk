pub mod model;

pub mod normal;
pub mod open;

use rusqlite::{Connection, Row};

use crate::model::FullModel;

use self::model::{ChannelId, ChannelModel, ChannelUserId, ChannelUserModel};

#[derive(Debug, Clone, Copy)]
pub struct ChannelEntry<'a>(pub &'a Connection);

impl<'a> ChannelEntry<'a> {
    pub fn insert(
        &self,
        channel: &FullModel<ChannelId, ChannelModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0.execute("INSERT INTO channel (
            id, type, active_user_count, new_chat_count, last_chat_log_id, last_seen_log_id, push_alert
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7
        )", (
            &channel.id,
            &channel.model.channel_type,
            &channel.model.active_user_count,
            &channel.model.new_chat_count,
            &channel.model.last_chat_log_id,
            &channel.model.last_seen_log_id,
            &channel.model.push_alert,
        ))?;

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

    pub fn map_row(row: &Row) -> Result<ChannelModel, rusqlite::Error> {
        Ok(ChannelModel {
            channel_type: row.get("type")?,
            active_user_count: row.get("active_user_count")?,
            new_chat_count: row.get("new_chat_count")?,
            last_chat_log_id: row.get("last_chat_log_id")?,
            last_seen_log_id: row.get("last_seen_log_id")?,
            push_alert: row.get("push_alert")?,
        })
    }

    pub fn map_full_row(row: &Row) -> Result<FullModel<ChannelId, ChannelModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get("id")?,
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
            "INSERT INTO channel_user (
            id, channel_id, nickname, profile_url, full_profile_url, original_profile_url, user_type
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7
        )",
            (
                &user.id,
                &user.model.channel_id,
                &user.model.nickname,
                &user.model.profile_url,
                &user.model.full_profile_url,
                &user.model.original_profile_url,
                &user.model.user_type,
            ),
        )?;

        Ok(())
    }

    pub fn get(&self, id: ChannelUserId) -> Result<ChannelUserModel, rusqlite::Error> {
        self.0.query_row(
            "SELECT * FROM channel_user WHERE id = ?",
            [id],
            Self::map_row,
        )
    }

    pub fn get_all_users_in(
        &self,
        id: ChannelId,
    ) -> Result<Vec<FullModel<ChannelUserId, ChannelUserModel>>, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM channel_user WHERE channel_id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(Self::map_full_row).into_iter().collect()
    }

    pub fn map_row(row: &Row) -> Result<ChannelUserModel, rusqlite::Error> {
        Ok(ChannelUserModel {
            channel_id: row.get("channel_id")?,
            nickname: row.get("nickname")?,
            profile_url: row.get("profile_url")?,
            full_profile_url: row.get("full_profile_url")?,
            original_profile_url: row.get("original_profile_url")?,
            user_type: row.get("user_type")?,
        })
    }

    pub fn map_full_row(
        row: &Row,
    ) -> Result<FullModel<ChannelUserId, ChannelUserModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get("id")?,
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
            last_chat_log_id: Some(0),
            last_seen_log_id: Some(0),
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
                last_chat_log_id: Some(0),
                last_seen_log_id: Some(0),
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
        };

        db.user().insert(&FullModel::new(0, model.clone()))?;

        assert_eq!(model, db.user().get(0)?);

        Ok(())
    }
}
