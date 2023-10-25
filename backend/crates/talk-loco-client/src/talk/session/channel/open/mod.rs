pub mod user;

use serde::{Deserialize, Serialize};

use crate::{request, RequestResult};

use self::user::User;

use super::TalkChannel;

#[derive(Debug, Clone, Copy)]
pub struct TalkOpenChannel<'a> {
    pub inner: TalkChannel<'a>,
    pub link_id: i64,
}

impl<'a> TalkOpenChannel<'a> {
    pub const fn new(inner: TalkChannel<'a>, link_id: i64) -> Self {
        Self { inner, link_id }
    }

    pub async fn noti_read(self, watermark: i64) -> RequestResult<()> {
        request!(self.inner.session, "NOTIREAD", bson {
            "chatId": self.inner.id,
            "watermark": watermark,
            "linkId": self.link_id,
        })
        .await
    }

    pub async fn list_users(self) -> RequestResult<Vec<User>> {
        #[derive(Deserialize)]
        struct Response {
            pub members: Vec<User>,
        }

        Ok(request!(self.inner.session, "GETMEM", bson {
            "chatId": self.inner.id,
        }, Response)
        .await?
        .members)
    }

    pub async fn users(self, user_ids: &[i64]) -> RequestResult<Vec<User>> {
        #[derive(Serialize)]
        struct Request<'a> {
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            #[serde(rename = "memberIds")]
            pub user_ids: &'a [i64],
        }

        #[derive(Deserialize)]
        struct Response {
            pub members: Vec<User>,
        }

        Ok(request!(
            self.inner.session,
            "MEMBER",
            &Request {
                chat_id: self.inner.id,
                user_ids,
            },
            Response
        )
        .await?
        .members)
    }
}
