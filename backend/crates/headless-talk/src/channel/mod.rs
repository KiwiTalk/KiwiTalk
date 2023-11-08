pub mod normal;
pub mod open;

use std::ops::Bound;

use crate::{
    conn::Conn,
    database::{
        model::{channel::ChannelListRow, chat::ChatRow},
        schema::{chat, user_profile},
        DatabasePool, PoolTaskError,
    },
    user::{DisplayUser, DisplayUserProfile},
    ClientResult,
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

pub type UserList<T> = Vec<(i64, T)>;

#[derive(Debug, Clone)]
pub struct ListPreviewChat {
    pub user: Option<DisplayUser>,
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
pub enum ClientChannel {
    Normal(NormalChannel),
    Open(OpenChannel),
}

#[derive(Debug, Clone, Copy)]
pub struct ChannelOp<'a> {
    id: i64,
    conn: &'a Conn,
}

impl<'a> ChannelOp<'a> {
    pub(crate) const fn new(id: i64, conn: &'a Conn) -> Self {
        Self { id, conn }
    }

    pub async fn send_chat(self, chat: Chat, no_seen: bool) -> ClientResult<Chatlog> {
        let res = TalkSession(&self.conn.session)
            .channel(self.id)
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
            channel_id: self.id,

            log_id: res.log_id,
            prev_log_id: Some(res.prev_id),

            author_id: self.conn.user_id,

            send_at: res.send_at,

            chat,

            referer: None,
        });

        self.conn
            .pool
            .spawn({
                let logged = logged.clone();

                move |conn| {
                    diesel::replace_into(chat::table)
                        .values(ChatRow::from_chatlog(logged, None))
                        .execute(conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(logged)
    }

    pub async fn delete_chat(self, log_id: i64) -> ClientResult<()> {
        let id = self.id;

        TalkSession(&self.conn.session)
            .channel(id)
            .delete_chat(log_id)
            .await?;

        self.conn
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

    pub async fn delete_chat_local(
        self,
        id: i64,
        log_id: i64,
        deleted_time: i64,
    ) -> Result<bool, PoolTaskError> {
        self.conn
            .pool
            .spawn(move |conn| {
                let count = diesel::update(chat::table)
                    .filter(chat::channel_id.eq(id).and(chat::log_id.eq(log_id)))
                    .set(chat::deleted_time.eq(deleted_time))
                    .execute(conn)?;

                Ok(count > 0)
            })
            .await
    }

    pub async fn load_chat_from(
        self,
        log_id: Bound<i64>,
        count: i64,
    ) -> Result<Vec<Chatlog>, PoolTaskError> {
        let id = self.id;

        self.conn
            .pool
            .spawn(move |conn| {
                let iter = match log_id {
                    Bound::Included(log_id) => chat::table
                        .filter(chat::channel_id.eq(id).and(chat::log_id.le(log_id)))
                        .order_by(chat::log_id.desc())
                        .limit(count)
                        .load_iter::<ChatRow, _>(conn),
                    Bound::Excluded(log_id) => chat::table
                        .filter(chat::channel_id.eq(id).and(chat::log_id.lt(log_id)))
                        .order_by(chat::log_id.desc())
                        .limit(count)
                        .load_iter::<ChatRow, _>(conn),
                    Bound::Unbounded => chat::table
                        .filter(chat::channel_id.eq(id))
                        .order_by(chat::log_id.desc())
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
        .spawn_transaction({
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
                    let user = if let Some((nickname, image_url)) = user_profile::table
                        .select((user_profile::nickname, user_profile::profile_url))
                        .filter(
                            user_profile::channel_id
                                .eq(channel_id)
                                .and(user_profile::id.eq(chat.author_id)),
                        )
                        .first::<(String, String)>(conn)
                        .optional()?
                    {
                        Some(DisplayUser {
                            id: chat.author_id,
                            profile: DisplayUserProfile {
                                nickname,
                                image_url: Some(image_url),
                            },
                        })
                    } else {
                        None
                    };

                    Some(ListPreviewChat {
                        user,
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
