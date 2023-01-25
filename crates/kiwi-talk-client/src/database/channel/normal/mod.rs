pub mod model;

use rusqlite::Row;

use crate::{database::model::FullModel, channel::{ChannelId, user::UserId}};

use self::model::{NormalChannelModel, NormalUserModel};

use super::{
    ChannelEntry, ChannelUserEntry,
};

#[derive(Debug, Clone, Copy)]
pub struct NormalChannelEntry<'a>(pub ChannelEntry<'a>);

impl<'a> NormalChannelEntry<'a> {
    pub fn insert(
        &self,
        channel: FullModel<ChannelId, NormalChannelModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0 .0.execute(
            "INSERT OR REPLACE INTO normal_channel VALUES (?, ?)",
            (channel.id, channel.model.join_time),
        )?;

        Ok(())
    }

    pub fn map_row(row: &Row) -> Result<NormalChannelModel, rusqlite::Error> {
        Ok(NormalChannelModel {
            join_time: row.get(1)?,
        })
    }

    pub fn map_full_row(
        row: &Row,
    ) -> Result<FullModel<ChannelId, NormalChannelModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get(0)?,
            model: Self::map_row(row)?,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub struct NormalUserEntry<'a>(pub ChannelUserEntry<'a>);

impl<'a> NormalUserEntry<'a> {
    pub fn insert(
        &self,
        user: &FullModel<UserId, NormalUserModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0 .0.execute(
            "INSERT INTO normal_channel_user VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            (
                user.id,
                user.model.channel_id,
                &user.model.country_iso,
                user.model.account_id,
                user.model.status_message.as_ref(),
                user.model.linked_services.as_ref(),
                user.model.suspended,
            ),
        )?;

        Ok(())
    }

    pub fn get(
        &self,
        id: UserId,
        channel_id: ChannelId,
    ) -> Result<NormalUserModel, rusqlite::Error> {
        self.0 .0.query_row(
            "SELLECT * FROM normal_channel_user WHERE id = ? AND channel_id = ?",
            (id, channel_id),
            Self::map_row,
        )
    }

    pub fn get_all(&self, id: UserId) -> Result<Vec<NormalUserModel>, rusqlite::Error> {
        let mut statement = self
            .0
             .0
            .prepare("SELECT * FROM normal_channel_user WHERE id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(Self::map_row).collect()
    }

    pub fn get_all_users_in(
        &self,
        id: ChannelId,
    ) -> Result<Vec<FullModel<UserId, NormalUserModel>>, rusqlite::Error> {
        let mut statement = self
            .0
             .0
            .prepare("SELECT * FROM normal_channel_user WHERE channel_id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(Self::map_full_row).collect()
    }

    pub fn map_row(row: &Row) -> Result<NormalUserModel, rusqlite::Error> {
        Ok(NormalUserModel {
            channel_id: row.get(1)?,
            country_iso: row.get(2)?,
            account_id: row.get(3)?,
            status_message: row.get(4)?,
            linked_services: row.get(5)?,
            suspended: row.get(6)?,
        })
    }

    pub fn map_full_row(
        row: &Row,
    ) -> Result<FullModel<UserId, NormalUserModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get(0)?,
            model: Self::map_row(row)?,
        })
    }
}
