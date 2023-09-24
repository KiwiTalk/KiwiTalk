mod command;
pub mod error;

use talk_loco_client::command::Command;

use crate::{
    channel::user::UserId,
    database::{
        channel::user::UserDatabaseExt,
        chat::{ChatDatabaseExt, ChatModel},
        pool::DatabasePool,
    },
    event::{
        channel::{ChannelEvent, ChatRead, ChatReceived},
        ClientEvent,
    },
    KiwiTalkClient,
};

use self::{
    command::{DecunRead, Kickout, Msg},
    error::HandlerError,
};

type HandlerResult = Result<Option<ClientEvent>, HandlerError>;

#[derive(Debug, Clone)]
pub struct ClientHandler {
    user_id: UserId,
    pool: DatabasePool,
}

impl ClientHandler {
    pub fn new(client: &KiwiTalkClient) -> Self {
        Self {
            user_id: client.user_id(),
            pool: client.pool().clone(),
        }
    }

    pub async fn handle(&self, command: &Command<impl AsRef<[u8]>>) -> HandlerResult {
        macro_rules! create_handler {
            (
                $($method:literal => $handler:path),* $(,)?
            ) => {
                match &*command.header.method {
                    $(
                        $method => $handler(self, ::bson::from_slice(command.data.as_ref())?).await?,
                    )*

                    _ => None,
                }
            };
        }

        Ok(create_handler!(
            "KICKOUT" => on_kickout,
            "CHANGESVR" => on_switch_server,

            "MSG" => on_chat,
            "DECUNREAD" => on_chat_read,
        ))
    }
}

async fn on_kickout(_: &ClientHandler, kickout: Kickout) -> HandlerResult {
    Ok(Some(ClientEvent::Kickout(kickout.reason)))
}

async fn on_switch_server(_: &ClientHandler, _: ()) -> HandlerResult {
    Ok(Some(ClientEvent::SwitchServer))
}

async fn on_chat(handler: &ClientHandler, msg: Msg) -> HandlerResult {
    handler
        .pool
        .spawn_task({
            let chatlog = msg.chatlog.clone();

            |connection| {
                connection.chat().insert(&ChatModel {
                    logged: chatlog,
                    deleted_time: None,
                })?;

                Ok(())
            }
        })
        .await?;

    Ok(Some(ClientEvent::Channel {
        id: msg.chat_id,

        event: ChannelEvent::Chat(ChatReceived {
            link_id: msg.link_id,

            log_id: msg.log_id,
            user_nickname: msg.author_nickname,
            chat: msg.chatlog,
        }),
    }))
}

async fn on_chat_read(handler: &ClientHandler, read: DecunRead) -> HandlerResult {
    handler
        .pool
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

        event: ChannelEvent::ChatRead(ChatRead {
            user_id: read.user_id,
            log_id: read.watermark,
        }),
    }))
}
