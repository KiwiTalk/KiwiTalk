pub mod user;

use diesel::{
    BoolExpressionMethods, ExpressionMethods, JoinOnDsl, OptionalExtension, QueryDsl, RunQueryDsl,
    SelectableHelper, SqliteConnection,
};
use talk_loco_client::talk::{
    channel::ChannelMetaType,
    session::{
        channel::{
            chat_on::{ChatOnChannelUsers, NormalChatOnChannel},
            normal,
        },
        TalkSession,
    },
};

use crate::{
    conn::Conn,
    database::{
        model::{
            channel::ChannelListRow,
            user::{
                normal::{NormalChannelUserModel, NormalChannelUserRow},
                UserProfileModel, UserProfileRow, UserProfileUpdate,
            },
        },
        schema::{channel_list, channel_meta, normal_channel_user, user_profile},
        DatabasePool, PoolTaskError,
    },
    updater::channel::ChannelUpdater,
    user::DisplayUser,
    ClientResult,
};

use self::user::NormalChannelUser;

use super::{ListChannelProfile, UserList};

#[derive(Debug, Clone)]
pub struct NormalChannel {
    pub users: UserList<NormalChannelUser>,
}

#[derive(Debug, Clone, Copy)]
pub struct NormalChannelOp<'a> {
    id: i64,
    conn: &'a Conn,
}

impl<'a> NormalChannelOp<'a> {
    pub(crate) const fn new(id: i64, conn: &'a Conn) -> Self {
        Self { id, conn }
    }

    pub const fn id(self) -> i64 {
        self.id
    }

    pub async fn read_chat(self, watermark: i64) -> ClientResult<()> {
        let id = self.id;

        TalkSession(&self.conn.session)
            .normal_channel(id)
            .noti_read(watermark)
            .await?;

        self.conn
            .pool
            .spawn(move |conn| {
                diesel::update(channel_list::table)
                    .filter(channel_list::id.eq(id))
                    .set(channel_list::last_seen_log_id.eq(watermark))
                    .execute(conn)?;

                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn leave(self, block: bool) -> ClientResult<()> {
        let id = self.id;

        TalkSession(&self.conn.session)
            .normal_channel(id)
            .leave(block)
            .await?;
        
        self.conn
            .pool
            .spawn_transaction(move |conn| ChannelUpdater::new(id).remove(conn))
            .await?;

        Ok(())
    }
}

pub(super) async fn load_list_profile(
    pool: &DatabasePool,
    display_users: &[DisplayUser],
    row: &ChannelListRow,
) -> Result<ListChannelProfile, PoolTaskError> {
    let id = row.id;

    let (name, image_url) = pool
        .spawn(move |conn| {
            let name: Option<String> = channel_meta::table
                .filter(
                    channel_meta::channel_id
                        .eq(id)
                        .and(channel_meta::type_.eq(ChannelMetaType::Title as i32)),
                )
                .select(channel_meta::content)
                .first(conn)
                .optional()?;

            let image_url: Option<String> = channel_meta::table
                .filter(
                    channel_meta::channel_id
                        .eq(id)
                        .and(channel_meta::type_.eq(ChannelMetaType::Profile as i32)),
                )
                .select(channel_meta::content)
                .first(conn)
                .optional()?;

            Ok((name, image_url))
        })
        .await?;

    let name = name.unwrap_or_else(|| {
        display_users
            .iter()
            .map(|user| user.profile.nickname.as_str())
            .collect::<Vec<&str>>()
            .join(", ")
    });

    Ok(ListChannelProfile { name, image_url })
}

pub(crate) async fn load_channel(
    id: i64,
    conn: &Conn,
    normal: NormalChatOnChannel,
) -> ClientResult<NormalChannel> {
    let users = conn
        .pool
        .spawn_transaction(move |conn| {
            let mut user_list: UserList<NormalChannelUser> = UserList::new();

            match normal.users {
                ChatOnChannelUsers::Ids(ids) => {
                    for user_id in ids.iter().copied() {
                        user_list.push((user_id, get_channel_user(conn, id, user_id)?));
                    }
                }

                ChatOnChannelUsers::Users(users) => {
                    update_channel_users(conn, id, &users)?;

                    for user_id in users.iter().map(|user| user.user_id) {
                        user_list.push((user_id, get_channel_user(conn, id, user_id)?));
                    }
                }
            }

            Ok(user_list)
        })
        .await?;

    Ok(NormalChannel { users })
}

fn get_channel_user(
    conn: &mut SqliteConnection,
    id: i64,
    user_id: i64,
) -> Result<NormalChannelUser, PoolTaskError> {
    let (profile, normal) = user_profile::table
        .filter(
            user_profile::channel_id
                .eq(id)
                .and(user_profile::id.eq(user_id)),
        )
        .inner_join(
            normal_channel_user::table.on(normal_channel_user::channel_id
                .eq(user_profile::channel_id)
                .and(normal_channel_user::id.eq(user_profile::id))),
        )
        .select((
            UserProfileModel::as_select(),
            NormalChannelUserModel::as_select(),
        ))
        .first::<(UserProfileModel, NormalChannelUserModel)>(conn)?;

    Ok(NormalChannelUser::from_models(profile, normal))
}

fn update_channel_users(
    conn: &mut SqliteConnection,
    id: i64,
    users: &[normal::user::User],
) -> Result<(), PoolTaskError> {
    for user in users {
        diesel::insert_into(user_profile::table)
            .values(UserProfileRow::from_normal_user(id, user))
            .on_conflict((user_profile::id, user_profile::channel_id))
            .do_update()
            .set(UserProfileUpdate::from(user))
            .execute(conn)?;
    }

    diesel::replace_into(normal_channel_user::table)
        .values(
            users
                .iter()
                .map(|user| NormalChannelUserRow::from_user(id, user))
                .collect::<Vec<_>>(),
        )
        .execute(conn)?;

    Ok(())
}
