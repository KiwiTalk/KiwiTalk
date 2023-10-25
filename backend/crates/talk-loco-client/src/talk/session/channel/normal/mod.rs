pub mod user;

use serde::{Deserialize, Serialize};

use crate::{request, RequestResult};

use self::user::User;

use super::TalkChannel;

#[derive(Debug, Clone, Copy)]
pub struct TalkNormalChannel<'a>(pub TalkChannel<'a>);

impl<'a> TalkNormalChannel<'a> {
    pub async fn noti_read(self, watermark: i64) -> RequestResult<()> {
        request!(self.0.session, "NOTIREAD", bson {
            "chatId": self.0.id,
            "watermark": watermark,
        })
        .await
    }

    pub async fn add_users(self, users: &[i64]) -> RequestResult<()> {
        #[derive(Serialize)]
        struct Request<'a> {
            #[serde(rename = "chatId")]
            chat_id: i64,

            #[serde(rename = "memberIds")]
            users: &'a [i64],
        }

        request!(
            self.0.session,
            "ADDMEM",
            &Request {
                chat_id: self.0.id,
                users
            }
        )
        .await
    }

    pub async fn list_users(self) -> RequestResult<Vec<User>> {
        #[derive(Deserialize)]
        struct Response {
            pub members: Vec<User>,
        }

        Ok(request!(self.0.session, "GETMEM", bson {
            "chatId": self.0.id,
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
            self.0.session,
            "MEMBER",
            &Request {
                chat_id: self.0.id,
                user_ids,
            },
            Response
        )
        .await?
        .members)
    }
}
