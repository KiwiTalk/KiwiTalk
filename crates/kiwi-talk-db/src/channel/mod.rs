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

    pub fn map_row(row: &Row) -> Result<ChannelModel, rusqlite::Error> {
        Ok(ChannelModel {
            channel_type: row.get("channel_type")?,
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
