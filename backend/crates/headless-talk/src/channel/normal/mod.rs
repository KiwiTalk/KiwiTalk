pub mod user;

use diesel::{
    BoolExpressionMethods, ExpressionMethods, JoinOnDsl, OptionalExtension, QueryDsl, RunQueryDsl,
    SelectableHelper,
};
use talk_loco_client::talk::channel::ChannelMetaType;

use crate::{
    database::{
        model::{channel::ChannelListRow, user::UserProfileModel},
        schema::{channel_meta, normal_channel_user, user_profile},
        DatabasePool, PoolTaskError,
    },
    user::{DisplayUser, UserProfile},
    HeadlessTalk,
};

use self::user::NormalChannelUser;

use super::ListChannelProfile;

#[derive(Debug, Clone, Copy)]
pub struct NormalChannel<'a> {
    id: i64,
    client: &'a HeadlessTalk,
}

impl<'a> NormalChannel<'a> {
    pub(crate) const fn new(id: i64, client: &'a HeadlessTalk) -> Self {
        Self { id, client }
    }

    pub const fn id(self) -> i64 {
        self.id
    }

    pub const fn client(self) -> &'a HeadlessTalk {
        self.client
    }

    pub async fn users(self) -> Result<Vec<NormalChannelUser>, PoolTaskError> {
        let users = self
            .client
            .pool
            .spawn(move |conn| {
                let users: Vec<((String, bool), UserProfileModel)> = user_profile::table
                    .inner_join(
                        normal_channel_user::table.on(normal_channel_user::id.eq(user_profile::id)),
                    )
                    .filter(user_profile::channel_id.eq(self.id))
                    .select((
                        (
                            normal_channel_user::country_iso,
                            normal_channel_user::suspended,
                        ),
                        UserProfileModel::as_select(),
                    ))
                    .load::<((String, bool), UserProfileModel)>(conn)?;

                Ok(users
                    .into_iter()
                    .map(|((country_iso, suspended), model)| NormalChannelUser {
                        country_iso,
                        suspended,
                        watermark: model.watermark.unwrap_or(0),
                        profile: UserProfile::from(model),
                    })
                    .collect())
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
