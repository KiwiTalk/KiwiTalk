use rusqlite::{Connection, OptionalExtension, Row};

use crate::{
    channel::{
        user::{UserProfile, UserId, UserProfileImage},
        ChannelId,
    },
    chat::LogId,
};

#[derive(Debug, Clone, PartialEq)]
pub struct UserModel {
    pub id: UserId,
    pub channel_id: i64,

    pub profile: UserProfile,

    pub watermark: i64,
}

impl UserModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            channel_id: row.get(1)?,

            profile: UserProfile {
                user_type: row.get(2)?,

                nickname: row.get(3)?,
                image: UserProfileImage {
                    image_url: row.get(4)?,
                    full_image_url: row.get(5)?,
                    original_image_url: row.get(6)?,
                },
            },

            watermark: row.get(7)?,
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
    pub fn insert(&self, model: &UserModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO channel_user VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                model.id,
                model.channel_id,
                model.profile.user_type,
                &model.profile.nickname,
                model.profile.image.image_url.as_ref(),
                model.profile.image.full_image_url.as_ref(),
                model.profile.image.original_image_url.as_ref(),
                model.watermark,
            ),
        )?;

        Ok(())
    }

    pub fn get(
        &self,
        id: UserId,
        channel_id: ChannelId,
    ) -> Result<Option<UserModel>, rusqlite::Error> {
        self.0.query_row(
            "SELECT * FROM channel_user WHERE id = ? AND channel_id = ?",
            (id, channel_id),
            UserModel::map_row,
        )
        .optional()
    }

    pub fn get_all(&self, id: UserId) -> Result<Vec<UserModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM channel_user WHERE id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(UserModel::map_row).collect()
    }

    pub fn get_all_in(&self, id: ChannelId) -> Result<Vec<UserModel>, rusqlite::Error> {
        let mut statement = self.0.prepare("SELECT * FROM channel_user WHERE channel_id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(UserModel::map_row).collect()
    }

    pub fn update_watermark(
        &self,
        id: UserId,
        channel_id: ChannelId,
        watermark: LogId,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE channel_user SET watermark = ? WHERE id = ? AND channel_id = ?",
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
            user::{UserProfile, UserId},
            ChannelId,
        },
        database::{
            channel::{tests::add_test_channel, user::UserModel},
            tests::prepare_test_database,
        },
    };

    use super::UserDatabaseExt;

    pub fn add_test_user(
        db: &Connection,
        id: UserId,
        channel_id: ChannelId,
    ) -> Result<UserModel, rusqlite::Error> {
        let model = UserModel {
            id,
            channel_id,
            profile: UserProfile {
                user_type: 0,
                nickname: "".into(),
                image: Default::default(),
            },
            watermark: 0,
        };

        db.user().insert(&model)?;

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