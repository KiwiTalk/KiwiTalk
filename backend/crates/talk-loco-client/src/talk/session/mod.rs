pub mod channel;
pub mod get_trailer;
pub mod load_channel_list;
pub mod login;
pub mod user;

use futures_loco_protocol::session::LocoSession;

use crate::{request, RequestResult};
use async_stream::try_stream;
use futures_lite::Stream;

use self::channel::{normal::TalkNormalChannel, open::TalkOpenChannel, TalkChannel};

#[derive(Debug, Clone, Copy)]
pub struct TalkSession<'a>(pub &'a LocoSession);

impl<'a> TalkSession<'a> {
    pub async fn ping(self) -> RequestResult<()> {
        request!(self.0, "PING", bson {}).await
    }

    pub async fn set_status(self, status: i32) -> RequestResult<()> {
        request!(self.0, "SETST", bson { "st": status }).await
    }

    pub async fn login(
        self,
        req: login::Request<'a>,
    ) -> RequestResult<(
        login::Response,
        Option<impl Stream<Item = RequestResult<load_channel_list::Response>> + 'a>,
    )> {
        let res = request!(self.0, "LOGINLIST", &req, login::Response).await?;

        if res.chat_list.eof {
            return Ok((res, None));
        }

        let mut req = load_channel_list::Request {
            chat_ids: req.chat_list.chat_ids,
            max_ids: req.chat_list.max_ids,
            last_token_id: res.chat_list.last_token_id.unwrap_or(0),
            last_chat_id: res.chat_list.last_chat_id,
        };

        let stream = try_stream!({
            loop {
                let res = request!(self.0, "LCHATLIST", &req, load_channel_list::Response).await?;

                if let Some(id) = res.last_token_id {
                    req.last_token_id = id;
                }
                req.last_chat_id = res.last_chat_id;

                let eof = res.eof;

                yield res;

                if eof {
                    break;
                }
            }
        });

        Ok((res, Some(stream)))
    }

    pub async fn get_trailer(
        self,
        chat_type: i32,
        key: &str,
    ) -> RequestResult<get_trailer::Response> {
        request!(self.0, "GETTRAILER", bson {
            "k": key,
            "t": chat_type,
        }, get_trailer::Response)
        .await
    }

    pub const fn channel(self, id: i64) -> TalkChannel<'a> {
        TalkChannel {
            session: self.0,
            id,
        }
    }

    pub const fn normal_channel(self, id: i64) -> TalkNormalChannel<'a> {
        TalkNormalChannel(self.channel(id))
    }

    pub const fn open_channel(self, id: i64, link_id: i64) -> TalkOpenChannel<'a> {
        TalkOpenChannel::new(self.channel(id), link_id)
    }
}
