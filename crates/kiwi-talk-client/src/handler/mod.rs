mod command;
pub mod error;

use talk_loco_client::command::Command;

use crate::{
    channel::user::UserId,
    database::pool::DatabasePool,
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
                        $method => $handler(self, ::bson::from_slice(command.data.as_ref())?)?,
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

fn on_kickout(_: &ClientHandler, kickout: Kickout) -> HandlerResult {
    Ok(Some(ClientEvent::Kickout(kickout.reason)))
}

fn on_switch_server(_: &ClientHandler, _: ()) -> HandlerResult {
    Ok(Some(ClientEvent::SwitchServer))
}

fn on_chat(_handler: &ClientHandler, msg: Msg) -> HandlerResult {
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

fn on_chat_read(_handler: &ClientHandler, read: DecunRead) -> HandlerResult {
    Ok(Some(ClientEvent::Channel {
        id: read.chat_id,

        event: ChannelEvent::ChatRead(ChatRead {
            user_id: read.user_id,
            log_id: read.watermark,
        }),
    }))
}
