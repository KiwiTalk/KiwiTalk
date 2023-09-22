pub mod load_channel_list;
pub mod login;
pub mod write;

pub use self::write::{request::WriteReq, response::WriteRes};
pub use load_channel_list::{request::LChatListReq, response::LChatListRes};
pub use login::{request::LoginListReq, response::LoginListRes};

use async_stream::try_stream;
use futures_lite::Stream;

use crate::{impl_session, RequestResult};

impl_session!(
    #[derive(Debug)]
    pub struct TalkSession {
        pub fn set_status("SETST", struct SetStReq {
            /// Status
            ///
            /// * Unlocked [`STATUS_UNLOCKED`]
            /// * Locked [`STATUS_LOCKED`]
            #[serde(rename = "st")]
            pub status: i32,
        });

        pub fn login("LOGINLIST", LoginListReq) -> LoginListRes;

        pub fn load_channel_list("LCHATLIST", LChatListReq) -> LChatListRes;

        pub fn write("WRITE", WriteReq) -> WriteRes;

        pub fn noti_read("NOTIREAD", struct NotiReadReq {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,
        
            /// Read message log id
            ///
            /// Official client decrease every unread chat read count till this chat.
            pub watermark: i64,

            pub link_id: Option<i64>,
        });
    }
);

impl<'a> TalkSession<'a> {
    pub fn channel_list_stream(
        self,
        mut last_token_id: i64,
        mut last_chat_id: Option<i64>,
    ) -> impl Stream<Item = RequestResult<LChatListRes>> + 'a {
        try_stream! {
            let mut eof = false;

            while !eof {
                let res = self.load_channel_list(&LChatListReq {
                    chat_ids: &[],
                    max_ids: &[],
                    last_token_id,
                    last_chat_id,
                }).await?;

                if let Some(id) = res.last_token_id {
                    last_token_id = id;
                }

                (last_chat_id, eof) = (res.last_chat_id, res.eof);
                yield res;
            }
        }
    }
}
