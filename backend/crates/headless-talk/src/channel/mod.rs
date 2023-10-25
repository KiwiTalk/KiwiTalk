pub mod normal;
pub mod open;

use std::{ops::Bound, time::SystemTime};

use crate::{
    database::{
        model::{channel::ChannelListRow, chat::ChatRow},
        schema::{self, channel_list, chat, user_profile},
        DatabasePool, PoolTaskError,
    },
    user::{DisplayUser, DisplayUserProfile},
    ClientResult, HeadlessTalk,
};
use arrayvec::ArrayVec;
use diesel::{
    dsl::sql, sql_types::Integer, BoolExpressionMethods, ExpressionMethods, OptionalExtension,
    QueryDsl, RunQueryDsl,
};
use nohash_hasher::IntMap;
use talk_loco_client::talk::{
    channel::{ChannelMeta, ChannelType},
    chat::{Chat, ChatType, Chatlog},
    session::{channel::write, TalkSession},
};

use self::{normal::NormalChannel, open::OpenChannel};

pub type ChannelMetaMap = IntMap<i32, ChannelMeta>;

#[derive(Debug, Clone)]
pub struct ListPreviewChat {
    pub profile: Option<DisplayUserProfile>,
    pub chatlog: Chatlog,
}

#[derive(Debug, Clone)]
pub struct ListChannelProfile {
    pub name: String,
    pub image_url: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ChannelListItem {
    pub channel_type: ChannelType,

    pub last_chat: Option<ListPreviewChat>,

    pub display_users: ArrayVec<DisplayUser, 4>,

    pub unread_count: i32,

    pub active_user_count: i32,

    pub profile: ListChannelProfile,
}

#[derive(Debug, Clone)]
pub enum ClientChannel<'a> {
    Normal(NormalChannel<'a>),
    Open(OpenChannel<'a>),
}

impl<'a> ClientChannel<'a> {
    pub const fn id(&self) -> i64 {
        match self {
            ClientChannel::Normal(normal) => normal.id(),
            ClientChannel::Open(open) => open.id(),
        }
    }

    pub const fn client(&self) -> &'a HeadlessTalk {
        match self {
            ClientChannel::Normal(normal) => normal.client(),
            ClientChannel::Open(open) => open.client(),
        }
    }

    pub async fn send_chat(&self, chat: Chat, no_seen: bool) -> ClientResult<Chatlog> {
        let client = self.client();
        let id = self.id();

        let res = TalkSession(&client.session)
            .channel(id)
            .write_chat(&write::Request {
                chat_type: chat.chat_type.0,
                msg_id: chat.message_id,
                message: chat.content.message.as_deref(),
                no_seen,
                attachment: chat.content.attachment.as_deref(),
                supplement: chat.content.supplement.as_deref(),
            })
            .await?;

        let logged = res.chatlog.unwrap_or(Chatlog {
            channel_id: id,

            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),

            author_id: client.user_id,

            send_at: res.send_at,

            chat,

            referer: None,
        });

        client
            .pool
            .spawn({
                let logged = logged.clone();

                move |conn| {
                    diesel::replace_into(schema::chat::table)
                        .values(ChatRow::from_chatlog(logged, None))
                        .execute(conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(logged)
    }

    pub async fn read_chat(&self, watermark: i64) -> ClientResult<()> {
        let (id, pool) = match self {
            ClientChannel::Normal(normal) => {
                let id = normal.id();
                let client = normal.client();

                TalkSession(&client.session)
                    .normal_channel(id)
                    .noti_read(watermark)
                    .await?;

                (id, &client.pool)
            }
            ClientChannel::Open(open) => {
                let id = open.id();
                let client = open.client();

                TalkSession(&client.session)
                    .open_channel(open.id(), open.link_id())
                    .noti_read(watermark)
                    .await?;

                (id, &client.pool)
            }
        };

        pool.spawn(move |conn| {
            diesel::update(channel_list::table)
                .filter(channel_list::id.eq(id))
                .set(channel_list::last_seen_log_id.eq(watermark))
                .execute(conn)?;

            Ok(())
        })
        .await?;

        Ok(())
    }

    pub async fn delete_chat(&self, log_id: i64) -> ClientResult<()> {
        let id = self.id();
        let client = self.client();

        TalkSession(&client.session)
            .channel(id)
            .delete_chat(log_id)
            .await?;

        client
            .pool
            .spawn(move |conn| {
                diesel::update(chat::table)
                    .filter(chat::channel_id.eq(id).and(chat::log_id.eq(log_id)))
                    .set(
                        chat::type_.eq(sql("(type | ")
                            .bind::<Integer, _>(ChatType::DELETED_MASK)
                            .sql(")")),
                    )
                    .execute(conn)?;

                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn delete_chat_local(&self, log_id: i64) -> Result<bool, PoolTaskError> {
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let id = self.id();

        Ok(self
            .client()
            .pool
            .spawn(move |conn| {
                let count = diesel::update(chat::table)
                    .filter(chat::channel_id.eq(id).and(chat::log_id.eq(log_id)))
                    .set(chat::deleted_time.eq(now))
                    .execute(conn)?;

                Ok(count > 0)
            })
            .await?)
    }

    pub async fn load_chat_from(
        self,
        log_id: Bound<i64>,
        count: i64,
    ) -> Result<Vec<Chatlog>, PoolTaskError> {
        let id = self.id();

        self.client()
            .pool
            .spawn(move |conn| {
                let iter = match log_id {
                    Bound::Included(log_id) => chat::table
                        .filter(chat::channel_id.eq(id).and(chat::log_id.le(log_id)))
                        .limit(count)
                        .load_iter::<ChatRow, _>(conn),
                    Bound::Excluded(log_id) => chat::table
                        .filter(chat::channel_id.eq(id).and(chat::log_id.lt(log_id)))
                        .limit(count)
                        .load_iter::<ChatRow, _>(conn),
                    Bound::Unbounded => chat::table
                        .filter(chat::channel_id.eq(id))
                        .limit(count)
                        .load_iter::<ChatRow, _>(conn),
                }?;

                Ok(iter
                    .map(|row| row.map(|row| row.into()))
                    .collect::<Result<_, _>>()?)
            })
            .await
    }
}

pub(crate) async fn load_list_item(
    pool: &DatabasePool,
    row: &ChannelListRow,
) -> Result<Option<ChannelListItem>, PoolTaskError> {
    let channel_type = ChannelType::from(row.channel_type.as_str());

    let (last_chat, display_users) = pool
        .spawn({
            let channel_id = row.id;
            let display_user_id_list =
                serde_json::from_str::<ArrayVec<i64, 4>>(&row.display_users).unwrap_or_default();

            move |conn| {
                let last_chat: Option<Chatlog> = chat::table
                    .filter(
                        chat::channel_id
                            .eq(channel_id)
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
                                .eq(channel_id)
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
                                .eq(channel_id)
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

                Ok((last_chat, display_users))
            }
        })
        .await?;

    let profile = match channel_type {
        ChannelType::DirectChat | ChannelType::MultiChat => {
            normal::load_list_profile(pool, &display_users, row).await?
        }

        _ => return Ok(None),
    };

    Ok(Some(ChannelListItem {
        channel_type,
        last_chat: last_chat.map(Into::into),
        display_users,
        unread_count: row.unread_count,
        active_user_count: row.active_user_count,
        profile,
    }))
}
