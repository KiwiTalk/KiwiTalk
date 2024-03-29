pub mod chat_on;
pub mod info;
pub mod normal;
pub mod open;
pub mod write;

use async_stream::try_stream;
use futures_lite::Stream;
use futures_loco_protocol::session::LocoSession;
use serde::{Deserialize, Serialize};

use crate::{
    request,
    talk::{channel::ChannelMeta, chat::Chatlog},
    RequestResult,
};

use self::{chat_on::ChatOnChannel, info::ChannelInfo};

#[derive(Debug, Clone, Copy)]
pub struct TalkChannel<'a> {
    pub session: &'a LocoSession,
    pub id: i64,
}

impl<'a> TalkChannel<'a> {
    pub const fn new(session: &'a LocoSession, id: i64) -> Self {
        Self { session, id }
    }

    pub async fn info(self) -> RequestResult<ChannelInfo> {
        #[derive(Deserialize)]
        struct Response {
            #[serde(rename = "chatInfo")]
            pub chat_info: ChannelInfo,
        }

        Ok(request!(self.session, "CHATINFO", bson {
            "chatId": self.id,
        }, Response)
        .await?
        .chat_info)
    }

    pub async fn chat_on(self, last_log_id: Option<i64>) -> RequestResult<ChatOnChannel> {
        request!(self.session, "CHATONROOM", bson {
            "chatId": self.id,
            "token": last_log_id.unwrap_or(0),
        }, _)
        .await
    }

    pub async fn write_chat(self, req: &write::Request<'_>) -> RequestResult<write::Response> {
        #[derive(Serialize)]
        struct Request<'a> {
            #[serde(rename = "chatId")]
            chat_id: i64,

            #[serde(flatten)]
            inner: &'a write::Request<'a>,
        }

        request!(
            self.session,
            "WRITE",
            &Request {
                chat_id: self.id,
                inner: req,
            },
            _
        )
        .await
    }

    pub async fn forward_chat(self, req: &write::Request<'_>) -> RequestResult<Chatlog> {
        #[derive(Serialize)]
        struct Request<'a> {
            #[serde(rename = "chatId")]
            chat_id: i64,

            #[serde(flatten)]
            inner: &'a write::Request<'a>,
        }

        #[derive(Deserialize)]
        struct Response {
            #[serde(rename = "chatLog")]
            chatlog: Chatlog,
        }

        Ok(request!(
            self.session,
            "FORWARD",
            &Request {
                chat_id: self.id,
                inner: req,
            },
            Response
        )
        .await?
        .chatlog)
    }

    pub async fn delete_chat(self, log_id: i64) -> RequestResult<()> {
        request!(self.session, "DELETEMSG", bson {
            "chatId": self.id,
            "logId": log_id,
        })
        .await
    }

    pub fn sync_chat_stream(
        self,
        current_log_id: i64,
        max_log_id: i64,
        count: i32,
    ) -> impl Stream<Item = RequestResult<Vec<Chatlog>>> + 'a {
        #[derive(Deserialize)]
        struct Response {
            #[serde(rename = "isOK")]
            pub is_ok: bool,

            /// Chatlog list
            #[serde(rename = "chatLogs")]
            pub chatlogs: Option<Vec<Chatlog>>,
        }

        try_stream!({
            let mut current = current_log_id;

            loop {
                let res = request!(self.session, "SYNCMSG", bson {
                    "chatId": self.id,
                    "cur": current,
                    "max": max_log_id,
                    "cnt": count,
                }, Response)
                .await?;

                match res.chatlogs {
                    Some(logs) if !logs.is_empty() => {
                        current = logs.last().unwrap().log_id;
                        yield logs;
                    }

                    _ => return,
                }

                if res.is_ok || current >= max_log_id {
                    return;
                }
            }
        })
    }

    pub async fn update(self, push_alert: bool) -> RequestResult<()> {
        request!(self.session, "UPDATECHAT", bson {
            "chatId": self.id,
            "pushAlert": push_alert,
        })
        .await
    }

    pub async fn set_meta(self, ty: i32, content: &str) -> RequestResult<ChannelMeta> {
        #[derive(Deserialize)]
        struct Response {
            pub meta: ChannelMeta,
        }

        Ok(request!(self.session, "SETMETA", bson {
            "chatId": self.id,
            "type": ty,
            "content": content,
        }, Response)
        .await?
        .meta)
    }
}
