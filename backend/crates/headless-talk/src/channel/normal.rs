use arrayvec::ArrayVec;
use diesel::{BoolExpressionMethods, ExpressionMethods, OptionalExtension, QueryDsl, RunQueryDsl};
use talk_loco_client::talk::{
    channel::{ChannelMetaType, ChannelType},
    chat::Chatlog,
    session::TalkSession,
};

use crate::{
    database::{
        model::{channel::ChannelListRow, chat::ChatRow},
        schema::{channel_meta, chat, user_profile},
        DatabasePool, PoolTaskError,
    },
    ClientResult, HeadlessTalk,
};

use super::{
    user::{DisplayUser, DisplayUserProfile},
    ChannelListItem, ListPreviewChat,
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

    let (last_chat, display_users, name) = pool
        .spawn(move |conn| {
            let last_chat: Option<Chatlog> = chat::table
                .filter(
                    chat::channel_id
                        .eq(row.id)
                        .and(chat::deleted_time.is_null()),
                )
                .order(chat::log_id.desc())
                .select(chat::all_columns)
                .first::<ChatRow>(conn)
                .optional()?
                .map(Into::into);

            let last_chat: Option<ListPreviewChat> = if let Some(chat) = last_chat {
                let profile = if let Some((nickname, image_url)) = user_profile::table
                    .select((user_profile::nickname, user_profile::profile_url))
                    .filter(
                        user_profile::channel_id
                            .eq(row.id)
                            .and(user_profile::id.eq(chat.author_id)),
                    )
                    .first::<(String, String)>(conn)
                    .optional()?
                {
                    Some(DisplayUserProfile {
                        nickname,
                        image_url: Some(image_url),
                    })
                } else {
                    None
                };

                Some(ListPreviewChat {
                    profile,
                    chatlog: chat,
                })
            } else {
                None
            };

            let mut display_users = ArrayVec::<DisplayUser, 4>::new();

            for id in display_user_id_list {
                if let Some((nickname, profile_url)) = user_profile::table
                    .select((user_profile::nickname, user_profile::profile_url))
                    .filter(
                        user_profile::channel_id
                            .eq(row.id)
                            .and(user_profile::id.eq(id)),
                    )
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

            let name: Option<String> = channel_meta::table
                .filter(
                    channel_meta::channel_id
                        .eq(row.id)
                        .and(channel_meta::type_.eq(ChannelMetaType::Title as i32)),
                )
                .select(channel_meta::content)
                .first(conn)
                .optional()?;

            Ok((last_chat, display_users, name))
        })
        .await?;

    let name = name.unwrap_or_else(|| {
        display_users
            .iter()
            .map(|user| user.profile.nickname.as_str())
            .collect::<Vec<&str>>()
            .join(", ")
    });

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
