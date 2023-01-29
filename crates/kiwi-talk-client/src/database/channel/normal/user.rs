use rusqlite::{Connection, OptionalExtension, Row};
use smallvec::SmallVec;

use crate::channel::{
    normal::user::NormalUserInfo,
    user::{DisplayUser, UserId, UserProfile, UserProfileImage},
    ChannelId,
};

#[derive(Debug, Clone, PartialEq)]
pub struct NormalUserModel {
    pub id: UserId,
    pub channel_id: i64,

    pub info: NormalUserInfo,
}

impl NormalUserModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            id: row.get(0)?,
            channel_id: row.get(1)?,

            info: NormalUserInfo {
                country_iso: row.get(2)?,
                account_id: row.get(3)?,
                status_message: row.get(4)?,
                linked_services: row.get(5)?,
                suspended: row.get(6)?,
            },
        })
    }
}

#[extend::ext(name = NormalUserDatabaseExt)]
pub impl Connection {
    fn normal_user(&self) -> NormalUserEntry {
        NormalUserEntry(self)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct NormalUserEntry<'a>(pub &'a Connection);

impl NormalUserEntry<'_> {
    pub fn insert(&self, model: &NormalUserModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT INTO normal_channel_user VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                model.id,
                model.channel_id,
                &model.info.country_iso,
                model.info.account_id,
                model.info.status_message.as_ref(),
                model.info.linked_services.as_ref(),
                model.info.suspended,
            ),
        )?;

        Ok(())
    }

    pub fn get(
        &self,
        id: UserId,
        channel_id: ChannelId,
    ) -> Result<Option<NormalUserModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELLECT * FROM normal_channel_user WHERE id = ? AND channel_id = ?",
                (id, channel_id),
                NormalUserModel::map_row,
            )
            .optional()
    }

    pub fn get_all(&self, id: UserId) -> Result<Vec<NormalUserModel>, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM normal_channel_user WHERE id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(NormalUserModel::map_row).collect()
    }

    pub fn get_all_users_in(&self, id: ChannelId) -> Result<Vec<NormalUserModel>, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM normal_channel_user WHERE channel_id = ?")?;

        let rows = statement.query([id])?;
        rows.mapped(NormalUserModel::map_row).collect()
    }

    pub fn get_display_users_in(
        &self,
        id: ChannelId,
    ) -> Result<SmallVec<[DisplayUser; 4]>, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare(
                "SELECT channel_user.id, channel_user.nickname, channel_user.profile_url, normal_channel_user.country_iso \
                FROM normal_channel_user \
                INNER JOIN channel_user \
                ON channel_user.id = normal_channel_user.id \
                WHERE channel_id = ?"
            )?;

        let rows = statement.query([id])?;
        rows.mapped(|row| {
            Ok(DisplayUser {
                id: row.get(0)?,
                profile: UserProfile {
                    nickname: row.get(1)?,
                    image: UserProfileImage {
                        image_url: row.get(2)?,
                        ..Default::default()
                    },
                },
                country_iso: row.get(3)?,
            })
        })
        .collect()
    }
}
