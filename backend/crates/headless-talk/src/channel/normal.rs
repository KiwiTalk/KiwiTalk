use arrayvec::ArrayVec;
use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, RunQueryDsl};
use itertools::Itertools;
use talk_loco_client::talk::{channel::ChannelType, chat::Chatlog, session::TalkSession};

use crate::{
    database::{
        model::{channel::ChannelListRow, chat::ChatRow},
        schema::{chat, user_profile},
        DatabasePool, PoolTaskError,
    },
    ClientResult, HeadlessTalk,
};

use super::{
    user::{DisplayUser, DisplayUserProfile},
    ChannelListItem,
};

#[derive(Debug, Clone, Copy)]
pub struct NormalChannel<'a> {
    id: i64,
    client: &'a HeadlessTalk,
}

impl<'a> NormalChannel<'a> {
    pub(crate) const fn new(id: i64, client: &'a HeadlessTalk) -> Self {
        Self { id, client }
    }

    pub const fn id(&self) -> i64 {
        self.id
    }

    pub const fn client(&self) -> &'_ HeadlessTalk {
        self.client
    }

    pub async fn read_chat(&self, watermark: i64) -> ClientResult<()> {
        TalkSession(&self.client.session)
            .normal_channel(self.id)
            .noti_read(watermark)
            .await?;

        Ok(())
    }
}

pub(crate) async fn load_list_item(
    pool: &DatabasePool,
    channel_type: ChannelType,
    row: ChannelListRow,
) -> Result<ChannelListItem, PoolTaskError> {
    let display_user_id_list =
        serde_json::from_str::<ArrayVec<i64, 4>>(&row.display_users).unwrap_or_default();

    let (last_chat, display_users) = pool
        .spawn(|conn| {
            let last_chat: Option<Chatlog> = chat::table
                .order(chat::log_id.desc())
                .filter(chat::deleted_time.is_null())
                .select(chat::all_columns)
                .first::<ChatRow>(conn)
                .optional()?
                .map(Into::into);

            let mut display_users = ArrayVec::<DisplayUser, 4>::new();

            for id in display_user_id_list {
                if let Some((nickname, profile_url)) = user_profile::table
                    .select((user_profile::nickname, user_profile::profile_url))
                    .filter(user_profile::id.eq(id))
                    .first::<(String, String)>(conn)
                    .optional()?
                {
                    display_users.push(DisplayUser {
                        id,
                        profile: DisplayUserProfile {
                            nickname,
                            image_url: Some(profile_url),
                        },
                    });
                }
            }

            Ok((last_chat, display_users))
        })
        .await?;

    let name = display_users
        .iter()
        .map(|user| &user.profile.nickname)
        .join(", ");

    Ok(ChannelListItem {
        channel_type,
        last_chat: last_chat.map(Into::into),
        display_users,
        unread_count: row.unread_count,
        active_user_count: row.active_user_count,
        name,
        profile_image: None,
    })
}
