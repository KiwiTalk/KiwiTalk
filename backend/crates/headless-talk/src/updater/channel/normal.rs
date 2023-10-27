use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl, SqliteConnection};
use futures_loco_protocol::session::LocoSession;
use talk_loco_client::talk::session::{channel::info::NormalChannelInfo, TalkSession};

use crate::{
    database::{
        model::{
            channel::normal::NormalChannelRow,
            user::{normal::NormalChannelUserRow, UserProfileRow},
        },
        schema::{normal_channel, normal_channel_user, user_profile},
        DatabasePool, PoolTaskError,
    },
    ClientResult,
};

#[derive(Debug)]
pub struct NormalChannelUpdater {
    id: i64,
}

impl NormalChannelUpdater {
    pub fn new(id: i64) -> Self {
        Self { id }
    }

    pub async fn initialize<F>(
        self,
        session: &LocoSession,
        pool: &DatabasePool,
        info: NormalChannelInfo,
        update_fn: F,
    ) -> ClientResult<()>
    where
        F: FnOnce(&mut SqliteConnection) -> Result<(), PoolTaskError> + Send + 'static,
    {
        let list = TalkSession(session)
            .normal_channel(self.id)
            .list_users()
            .await?;

        pool.spawn(move |conn| {
            let profiles = list
                .iter()
                .map(|user| UserProfileRow::from_normal_user(self.id, user))
                .collect::<Vec<_>>();

            let users = list
                .iter()
                .map(|user| NormalChannelUserRow::from_user(self.id, user))
                .collect::<Vec<_>>();

            diesel::replace_into(user_profile::table)
                .values(profiles)
                .execute(conn)?;

            diesel::replace_into(normal_channel_user::table)
                .values(users)
                .execute(conn)?;

            diesel::replace_into(normal_channel::table)
                .values(NormalChannelRow {
                    id: self.id,
                    joined_at_for_new_mem: Some(info.joined_at_for_new_mem),
                    inviter_user_id: info.inviter_id,
                })
                .execute(conn)?;

            update_fn(conn)?;

            Ok(())
        })
        .await?;

        Ok(())
    }

    pub fn remove(self, conn: &mut SqliteConnection) -> Result<(), PoolTaskError> {
        diesel::delete(normal_channel::table.filter(normal_channel::id.eq(self.id)))
            .execute(conn)?;

        diesel::delete(
            normal_channel_user::table.filter(normal_channel_user::channel_id.eq(self.id)),
        )
        .execute(conn)?;

        Ok(())
    }
}
