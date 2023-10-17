pub mod error;

use talk_loco_client::talk::stream::{
    command::{DecunRead, Kickout, Msg},
    StreamCommand,
};

use crate::{
    chat::Chatlog,
    database::{
        channel::user::UserDatabaseExt,
        chat::{ChatDatabaseExt, ChatRow},
        pool::DatabasePool,
    },
    event::{channel::ChannelEvent, ClientEvent},
};

use self::error::HandlerError;

type HandlerResult = Result<Option<ClientEvent>, HandlerError>;

#[derive(Debug, Clone)]
pub struct SessionHandler {
    pool: DatabasePool,
}

impl SessionHandler {
    pub fn new(pool: DatabasePool) -> Self {
        Self { pool }
    }

    pub async fn handle(&self, command: StreamCommand) -> HandlerResult {
        match command {
            StreamCommand::Kickout(kickout) => self.on_kickout(kickout).await,
            StreamCommand::SwitchServer => self.on_switch_server().await,
            StreamCommand::Chat(msg) => self.on_chat(msg).await,
            StreamCommand::ChatRead(read) => self.on_chat_read(read).await,

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
        let chat = Chatlog::from(msg.chatlog);

        self.pool
            .spawn_task({
                let chatlog = chat.clone();

                |connection| {
                    connection.chat().insert(&ChatRow {
                        log: chatlog,
                        deleted_time: None,
                    })?;

                    Ok(())
                }
            })
            .await?;

        Ok(Some(ClientEvent::Channel {
            id: msg.chat_id,

            event: ChannelEvent::Chat {
                link_id: msg.link_id,

                user_nickname: msg.author_nickname,
                chat,
            },
        }))
    }

    async fn on_chat_read(&self, read: DecunRead) -> HandlerResult {
        self.pool
            .spawn_task({
                let DecunRead {
                    chat_id,
                    user_id,
                    watermark,
                } = read.clone();

                move |connection| {
                    connection
                        .user()
                        .update_watermark(chat_id, user_id, watermark)?;

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
}
