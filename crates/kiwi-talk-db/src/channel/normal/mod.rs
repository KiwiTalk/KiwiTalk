pub mod model;

use rusqlite::Row;

use self::model::{NormalChannelModel, NormalUserModel};

use super::{ChannelEntry, ChannelUserEntry};

#[derive(Debug, Clone, Copy)]
pub struct NormalChannelEntry<'a>(pub ChannelEntry<'a>);

impl<'a> NormalChannelEntry<'a> {
    pub fn insert(&self, channel: &NormalChannelModel) -> Result<(), rusqlite::Error> {
        self.0 .0.execute(
            "INSERT INTO normal_channel (
            id, join_time
        ) VALUES (
            ?1, ?2
        )",
            (&channel.id, &channel.join_time),
        )?;

        Ok(())
    }

    fn map_row(row: &Row) -> Result<NormalChannelModel, rusqlite::Error> {
        Ok(NormalChannelModel {
            id: row.get("id")?,
            join_time: row.get("join_time")?,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub struct NormalUserEntry<'a>(pub ChannelUserEntry<'a>);

impl<'a> NormalUserEntry<'a> {
    pub fn insert(&self, user: &NormalUserModel) -> Result<(), rusqlite::Error> {
        self.0 .0.execute(
            "INSERT INTO normal_channel_user (
            id, channel_id, country_iso, account_id, status_message, linked_services, suspended
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7
        )",
            (
                &user.id,
                &user.channel_id,
                &user.country_iso,
                &user.account_id,
                &user.status_message,
                &user.linked_services,
                &user.suspended,
            ),
        )?;

        Ok(())
    }

    fn map_row(row: &Row) -> Result<NormalUserModel, rusqlite::Error> {
        Ok(NormalUserModel {
            id: row.get("id")?,
            channel_id: row.get("channel_id")?,
            country_iso: row.get("country_iso")?,
            account_id: row.get("account_id")?,
            status_message: row.get("status_message")?,
            linked_services: row.get("linked_services")?,
            suspended: row.get("suspended")?,
        })
    }
}
