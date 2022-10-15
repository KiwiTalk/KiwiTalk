pub mod model;

pub mod normal;
pub mod open;

use rusqlite::{Connection, Row};

use self::model::{ChannelModel, ChannelUserModel};

#[derive(Debug, Clone, Copy)]
pub struct ChannelEntry<'a>(pub &'a Connection);

impl<'a> ChannelEntry<'a> {
    pub fn insert(&self, channel: &ChannelModel) -> Result<(), rusqlite::Error> {
        self.0.execute("INSERT INTO channel (
            id, type, active_user_count, new_chat_count, last_chat_log_id, last_seen_log_id, push_alert
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7
        )", (
            &channel.id,
            &channel.channel_type,
            &channel.active_user_count,
            &channel.new_chat_count,
            &channel.last_chat_log_id,
            &channel.last_seen_log_id,
            &channel.push_alert,
        ))?;

        Ok(())
    }

    fn map_row(row: &Row) -> Result<ChannelModel, rusqlite::Error> {
        Ok(ChannelModel {
            id: row.get("id")?,
            channel_type: row.get("channel_type")?,
            active_user_count: row.get("active_user_count")?,
            new_chat_count: row.get("new_chat_count")?,
            last_chat_log_id: row.get("last_chat_log_id")?,
            last_seen_log_id: row.get("last_seen_log_id")?,
            push_alert: row.get("push_alert")?,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChannelUserEntry<'a>(pub &'a Connection);

impl<'a> ChannelUserEntry<'a> {
    pub fn insert(&self, user: &ChannelUserModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT INTO channel_user (
            id, channel_id, nickname, profile_url, full_profile_url, original_profile_url, user_type
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7
        )",
            (
                &user.id,
                &user.channel_id,
                &user.nickname,
                &user.profile_url,
                &user.full_profile_url,
                &user.original_profile_url,
                &user.user_type,
            ),
        )?;

        Ok(())
    }

    fn map_row(row: &Row) -> Result<ChannelUserModel, rusqlite::Error> {
        Ok(ChannelUserModel {
            id: row.get("id")?,
            channel_id: row.get("channel_id")?,
            nickname: row.get("nickname")?,
            profile_url: row.get("profile_url")?,
            full_profile_url: row.get("full_profile_url")?,
            original_profile_url: row.get("original_profile_url")?,
            user_type: row.get("user_type")?,
        })
    }
}
