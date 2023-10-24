use diesel::{BoolExpressionMethods, ExpressionMethods, OptionalExtension, QueryDsl, RunQueryDsl};
use talk_loco_client::talk::channel::ChannelMetaType;

use crate::{
    database::{model::channel::ChannelListRow, schema::channel_meta, DatabasePool, PoolTaskError},
    HeadlessTalk,
};

use super::{user::DisplayUser, ListChannelProfile};

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
