pub mod error;

use diesel::{dsl::exists, BoolExpressionMethods, ExpressionMethods, QueryDsl, RunQueryDsl};
use futures_loco_protocol::loco_protocol::command::BoxedCommand;
use talk_loco_client::talk::stream::{
    command::{ChgMeta, DecunRead, Kickout, Left, Msg, SyncDlMsg, SyncJoin},
    StreamCommand,
};

use crate::{
    conn::Conn,
    database::{
        model::{
            channel::meta::ChannelMetaRow,
            chat::{ChatRow, ChatUpdate},
        },
        schema::{self, channel_list, channel_meta, chat},
    },
    event::{channel::ChannelEvent, ClientEvent},
    updater::channel::ChannelUpdater,
};

use self::error::HandlerError;

type HandlerResult = Result<Option<ClientEvent>, HandlerError>;

#[derive(Debug, Clone)]
pub(crate) struct SessionHandler {
    conn: Conn,
}

impl SessionHandler {
    pub fn new(conn: Conn) -> Self {
        Self { conn }
    }

    pub async fn handle(&self, read: BoxedCommand) -> HandlerResult {
        match StreamCommand::deserialize_from(read)? {
            StreamCommand::Kickout(kickout) => self.on_kickout(kickout).await,
            StreamCommand::SwitchServer => self.on_switch_server().await,
            StreamCommand::Chat(msg) => self.on_chat(msg).await,
            StreamCommand::ChatRead(read) => self.on_chat_read(read).await,
            StreamCommand::ChangeMeta(meta) => self.on_meta_change(meta).await,
            StreamCommand::SyncChatDeletion(deletion) => self.on_chat_deleted(deletion).await,
            StreamCommand::SyncChannelJoin(sync_join) => self.on_channel_join(sync_join).await,
            StreamCommand::Left(left) => self.on_left(left).await,

            _ => Ok(None),
        }
    }

    async fn on_kickout(&self, kickout: Kickout) -> HandlerResult {
        Ok(Some(ClientEvent::Kickout(kickout.reason)))
    }

    async fn on_switch_server(&self) -> HandlerResult {
        Ok(Some(ClientEvent::SwitchServer))
    }

    async fn on_chat(&self, msg: Msg) -> HandlerResult {
        let exists = self
            .conn
            .pool
            .spawn({
                let row = ChatRow::from_chatlog(msg.chatlog.clone(), None);

                move |conn| {
                    let count = diesel::select(exists(
                        channel_list::table.filter(channel_list::id.eq(row.channel_id)),
                    ))
                    .execute(conn)?;

                    diesel::replace_into(chat::table)
                        .values(row)
                        .execute(conn)?;

                    Ok(count > 0)
                }
            })
            .await?;

        if !exists {
            ChannelUpdater::new(msg.chat_id)
                .initialize(&self.conn.session, &self.conn.pool)
                .await?;
        }

        Ok(Some(ClientEvent::Channel {
            id: msg.chat_id,

            event: ChannelEvent::Chat {
                link_id: msg.link_id,

                user_nickname: msg.author_nickname,
                chat: msg.chatlog,
            },
        }))
    }

    async fn on_chat_read(&self, read: DecunRead) -> HandlerResult {
        self.conn
            .pool
            .spawn({
                let DecunRead {
                    chat_id: channel_id,
                    user_id,
                    watermark,
                } = read.clone();

                move |conn| {
                    use schema::user_profile;

                    diesel::update(user_profile::table)
                        .filter(
                            user_profile::channel_id
                                .eq(channel_id)
                                .and(user_profile::id.eq(user_id)),
                        )
                        .set(user_profile::watermark.eq(watermark))
                        .execute(conn)?;
                    Ok(())
                }
            })
            .await?;

        Ok(Some(ClientEvent::Channel {
            id: read.chat_id,

            event: ChannelEvent::ChatRead {
                user_id: read.user_id,
                log_id: read.watermark,
            },
        }))
    }

    async fn on_meta_change(&self, value: ChgMeta) -> HandlerResult {
        self.conn
            .pool
            .spawn({
                let value = value.clone();

                move |conn| {
                    diesel::replace_into(channel_meta::table)
                        .values(ChannelMetaRow::from(value))
                        .execute(conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(Some(ClientEvent::Channel {
            id: value.chat_id,
            event: ChannelEvent::ChangeMeta(value.meta),
        }))
    }

    async fn on_chat_deleted(&self, value: SyncDlMsg) -> HandlerResult {
        self.conn
            .pool
            .spawn({
                let chatlog = value.chatlog.clone();

                move |conn| {
                    diesel::update(chat::table)
                        .filter(
                            chat::log_id
                                .eq(chatlog.log_id)
                                .and(chat::channel_id.eq(chatlog.channel_id)),
                        )
                        .set(ChatUpdate::from(chatlog))
                        .execute(conn)?;

                    Ok(())
                }
            })
            .await?;

        Ok(Some(ClientEvent::Channel {
            id: value.chatlog.channel_id,
            event: ChannelEvent::ChatDeleted(value.chatlog),
        }))
    }

    async fn on_channel_join(&self, sync_join: SyncJoin) -> HandlerResult {
        ChannelUpdater::new(sync_join.chat_id)
            .initialize(&self.conn.session, &self.conn.pool)
            .await?;

        Ok(Some(ClientEvent::Channel {
            id: sync_join.chat_id,
            event: ChannelEvent::Added {
                chatlog: sync_join.chatlog,
            },
        }))
    }

    async fn on_left(&self, left: Left) -> HandlerResult {
        let channel_id = left.chat_id;

        self.conn
            .pool
            .spawn_transaction(move |conn| Ok(ChannelUpdater::new(channel_id).remove(conn)?))
            .await?;

        Ok(Some(ClientEvent::Channel {
            id: channel_id,
            event: ChannelEvent::Left,
        }))
    }
}
