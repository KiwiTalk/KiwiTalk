pub mod model;

use rusqlite::Row;

use crate::model::FullModel;

use self::model::{NormalChannelModel, NormalUserModel};

use super::{
    model::{ChannelId, ChannelUserId},
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
            "INSERT INTO normal_channel (
            id, join_time
        ) VALUES (
            ?1, ?2
        )",
            (&channel.id, &channel.model.join_time),
        )?;

        Ok(())
    }

    pub fn map_row(row: &Row) -> Result<NormalChannelModel, rusqlite::Error> {
        Ok(NormalChannelModel {
            join_time: row.get("join_time")?,
        })
    }

    pub fn map_full_row(
        row: &Row,
    ) -> Result<FullModel<ChannelId, NormalChannelModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get("id")?,
            model: Self::map_row(row)?,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub struct NormalUserEntry<'a>(pub ChannelUserEntry<'a>);

impl<'a> NormalUserEntry<'a> {
    pub fn insert(
        &self,
        user: &FullModel<ChannelUserId, NormalUserModel>,
    ) -> Result<(), rusqlite::Error> {
        self.0 .0.execute(
            "INSERT INTO normal_channel_user (
            id, channel_id, country_iso, account_id, status_message, linked_services, suspended
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7
        )",
            (
                &user.id,
                &user.model.channel_id,
                &user.model.country_iso,
                &user.model.account_id,
                &user.model.status_message,
                &user.model.linked_services,
                &user.model.suspended,
            ),
        )?;

        Ok(())
    }

    pub fn map_row(row: &Row) -> Result<NormalUserModel, rusqlite::Error> {
        Ok(NormalUserModel {
            channel_id: row.get("channel_id")?,
            country_iso: row.get("country_iso")?,
            account_id: row.get("account_id")?,
            status_message: row.get("status_message")?,
            linked_services: row.get("linked_services")?,
            suspended: row.get("suspended")?,
        })
    }

    pub fn map_full_row(
        row: &Row,
    ) -> Result<FullModel<ChannelUserId, NormalUserModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get("id")?,
            model: Self::map_row(row)?,
        })
    }
}
