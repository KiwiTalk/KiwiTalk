pub mod user;

use diesel::{
    BoolExpressionMethods, ExpressionMethods, JoinOnDsl, OptionalExtension, QueryDsl,
    RunQueryDsl, SelectableHelper, SqliteConnection,
};
use talk_loco_client::talk::{
    channel::ChannelMetaType,
    session::channel::{
        chat_on::{ChatOnChannelUsers, NormalChatOnChannel},
        normal,
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
        schema::{channel_meta, normal_channel_user, user_profile},
        DatabasePool, PoolTaskError,
    },
    user::DisplayUser,
    ClientResult, HeadlessTalk,
};

use self::user::NormalChannelUser;

use super::{ListChannelProfile, UserList};

#[derive(Debug)]
pub struct NormalChannel {
    id: i64,
    pub(super) conn: Conn,
}

impl NormalChannel {
    pub const fn id(&self) -> i64 {
        self.id
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

pub(crate) async fn open_channel(
    id: i64,
    client: &HeadlessTalk,
    normal: NormalChatOnChannel,
) -> ClientResult<(NormalChannel, UserList<NormalChannelUser>)> {
    let user_list = client
        .conn
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

    Ok((
        NormalChannel {
            id,
            conn: client.conn.clone(),
        },
        user_list,
    ))
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
