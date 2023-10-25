pub mod user;

use diesel::{
    BoolExpressionMethods, Connection, ExpressionMethods, JoinOnDsl, OptionalExtension, QueryDsl,
    RunQueryDsl, SelectableHelper,
};
use talk_loco_client::talk::{
    channel::ChannelMetaType, session::channel::chat_on::NormalChatOnChannel,
};

use crate::{
    database::{
        model::{
            channel::ChannelListRow,
            user::{
                normal::{NormalChannelUserModel, NormalChannelUserRow},
                UserProfileModel, UserProfileRow,
            },
        },
        schema::{channel_meta, normal_channel_user, user_profile},
        DatabasePool, PoolTaskError,
    },
    user::DisplayUser,
    ClientResult, HeadlessTalk,
};

use self::user::NormalChannelUser;

use super::ListChannelProfile;

#[derive(Debug, Clone)]
pub struct NormalChannel<'a> {
    id: i64,
    client: &'a HeadlessTalk,
}

impl<'a> NormalChannel<'a> {
    pub const fn id(&self) -> i64 {
        self.id
    }

    pub const fn client(&self) -> &'a HeadlessTalk {
        self.client
    }

    pub async fn users(&self) -> Result<Vec<NormalChannelUser>, PoolTaskError> {
        let users = self
            .client
            .pool
            .spawn({
                let id = self.id;

                move |conn| {
                    let users: Vec<NormalChannelUser> = user_profile::table
                        .inner_join(
                            normal_channel_user::table.on(normal_channel_user::channel_id
                                .eq(user_profile::channel_id)
                                .and(normal_channel_user::id.eq(user_profile::id))),
                        )
                        .filter(user_profile::channel_id.eq(id))
                        .select((
                            UserProfileModel::as_select(),
                            NormalChannelUserModel::as_select(),
                        ))
                        .load_iter::<(UserProfileModel, NormalChannelUserModel), _>(conn)?
                        .map(|res| {
                            res.map(|(profile, normal)| {
                                NormalChannelUser::from_models(profile, normal)
                            })
                        })
                        .collect::<Result<_, _>>()?;

                    Ok(users)
                }
            })
            .await?;

        Ok(users)
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
) -> ClientResult<NormalChannel> {
    if let Some(users) = normal.users {
        client
            .pool
            .spawn(move |conn| {
                conn.transaction(move |conn| {
                    diesel::replace_into(user_profile::table)
                        .values(
                            users
                                .iter()
                                .map(|user| UserProfileRow {
                                    id: user.user_id,
                                    channel_id: id,
                                    nickname: &user.nickname,
                                    profile_url: &user.profile_image_url,
                                    full_profile_url: &user.full_profile_image_url,
                                    original_profile_url: &user.original_profile_image_url,
                                })
                                .collect::<Vec<_>>(),
                        )
                        .execute(conn)?;

                    diesel::replace_into(normal_channel_user::table)
                        .values(
                            users
                                .iter()
                                .map(|user| NormalChannelUserRow {
                                    id: user.user_id,
                                    channel_id: id,
                                    country_iso: &user.country_iso,
                                    account_id: user.account_id,
                                    status_message: &user.status_message,
                                    linked_services: &user.linked_services,
                                    suspended: user.suspended,
                                })
                                .collect::<Vec<_>>(),
                        )
                        .execute(conn)?;

                    Ok::<_, PoolTaskError>(())
                })?;

                Ok(())
            })
            .await?;
    }

    Ok(NormalChannel { id, client })
}
