use rusqlite::{Connection, OptionalExtension, Row};

use crate::{
    channel::{
        user::{UserId, UserProfile},
        ChannelId,
    },
    chat::LogId,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UserProfileRow {
    pub id: UserId,
    pub channel_id: i64,

    pub profile: UserProfile,

    pub watermark: i64,
}

impl UserProfileRow {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            channel_id: row.get(1)?,

            profile: UserProfile {
                nickname: row.get(2)?,
                image_url: row.get(3)?,
                full_image_url: row.get(4)?,
                original_image_url: row.get(5)?,
            },

            watermark: row.get(6)?,
        })
    }
}

#[extend::ext(name = UserDatabaseExt)]
pub impl Connection {
    fn user(&self) -> UserEntry {
        UserEntry(self)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct UserEntry<'a>(pub &'a Connection);

impl UserEntry<'_> {
    pub fn insert_or_replace(&self, model: &UserProfileRow) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO user_profile VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                model.id,
                model.channel_id,
                &model.profile.nickname,
                model.profile.image_url.as_ref(),
                model.profile.full_image_url.as_ref(),
                model.profile.original_image_url.as_ref(),
                model.watermark,
            ),
        )?;

        Ok(())
    }

    pub fn insert_or_update_profile(
        &self,
        id: UserId,
        channel_id: i64,
        profile: &UserProfile,
    ) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO user_profile (id, channel_id, nickname, profile_url, full_profile_url, original_profile_url) \
            VALUES (?, ?, ?, ?, ?, ?)",
            (
                id,
                channel_id,
                &profile.nickname,
                profile.image_url.as_ref(),
                profile.full_image_url.as_ref(),
                profile.original_image_url.as_ref(),
            ),
        )?;

        Ok(())
    }

    pub fn get(
        &self,
        id: UserId,
        channel_id: ChannelId,
    ) -> Result<Option<UserProfileRow>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM user_profile WHERE id = ? AND channel_id = ?",
                (id, channel_id),
                UserProfileRow::map_row,
            )
            .optional()
    }

    pub fn get_all<B: FromIterator<UserProfileRow>>(&self, id: UserId) -> Result<B, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM user_profile WHERE id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(UserProfileRow::map_row).collect()
    }

    pub fn get_all_in<B: FromIterator<UserProfileRow>>(
        &self,
        id: ChannelId,
    ) -> Result<B, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM user_profile WHERE channel_id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(UserProfileRow::map_row).collect()
    }

    pub fn update_watermark(
        &self,
        id: UserId,
        channel_id: ChannelId,
        watermark: LogId,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE user_profile SET watermark = ? WHERE id = ? AND channel_id = ?",
            (watermark, id, channel_id),
        )
    }
}

#[cfg(test)]
pub(crate) mod tests {
    use std::error::Error;

    use rusqlite::Connection;

    use crate::{
        channel::{
            user::{UserId, UserProfile},
            ChannelId,
        },
        database::{
            channel::{tests::add_test_channel, user::UserProfileRow},
            tests::prepare_test_database,
        },
    };

    use super::UserDatabaseExt;

    pub fn add_test_user(
        db: &Connection,
        id: UserId,
        channel_id: ChannelId,
    ) -> Result<UserProfileRow, rusqlite::Error> {
        let model = UserProfileRow {
            id,
            channel_id,
            profile: UserProfile {
                nickname: "".into(),
                ..Default::default()
            },
            watermark: 0,
        };

        db.user().insert_or_replace(&model)?;

        Ok(model)
    }

    #[test]
    fn channel_user_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;

        add_test_channel(&db, 0)?;
        let model = add_test_user(&db, 0, 0)?;

        assert_eq!(model, db.user().get(0, 0)?.unwrap());

        Ok(())
    }
}
