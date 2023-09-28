pub mod channel_info;
pub mod chat_on_channel;
pub mod load_channel_list;
pub mod login;
pub mod write_chat;

pub use channel_info::{request::ChannelInfoReq, response::ChannelInfoRes};
pub use chat_on_channel::{request::ChatOnChannelReq, response::ChatOnChannelRes};
pub use load_channel_list::{request::LChatListReq, response::LChatListRes};
pub use login::{request::LoginListReq, response::LoginListRes};
pub use write_chat::{request::WriteChatReq, response::WriteChatRes};

use crate::{
    impl_session,
    structs::{channel::ChannelMeta, chat::Chatlog, user::UserVariant},
    RequestResult,
};
use async_stream::try_stream;
use futures_lite::Stream;

impl_session!(
    #[derive(Debug)]
    pub struct TalkSession {
        pub fn set_status("SETST", struct SetStReq {
            /// Status
            ///
            /// * Unlocked: 1
            /// * Locked: 2
            #[serde(rename = "st")]
            pub status: i32,
        });

        pub fn login("LOGINLIST", LoginListReq) -> LoginListRes;

        pub fn load_channel_list("LCHATLIST", LChatListReq) -> LChatListRes;

        pub fn write_chat("WRITE", WriteChatReq) -> WriteChatRes;

        pub fn forward_chat("FORWARD", WriteChatReq) -> struct ForwardChatRes {
            /// Fowarded message
            #[serde(rename = "chatLog")]
            pub chatlog: Chatlog,
        };

        pub fn delete_chat("DELETEMSG", struct DeleteChatReq {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// Chat log id
            #[serde(rename = "logId")]
            pub log_id: i64,
        });

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

        pub fn sync_chat("SYNCMSG", struct SyncChatReq {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// Current written last chat log id in client.
            #[serde(rename = "cur")]
            pub current: i64,

            /// Max number to receive once.
            /// The default is 300. But the server always seems to send up to 300 regardless of the number.
            #[serde(rename = "cnt")]
            pub count: i32,

            /// Last chat log id received by server.
            pub max: i64,
        }) -> struct SyncChatRes {
            /// true if no more chat left below.
            #[serde(rename = "isOK")]
            pub is_ok: bool,

            /// Chatlog list
            #[serde(rename = "chatLogs")]
            pub chatlogs: Option<Vec<Chatlog>>,

            /// Unknown
            #[serde(rename = "jsi")]
            pub jsi: Option<i64>,

            #[serde(rename = "lastTokenId")]
            pub last_token_id: i64,
        };

        pub fn leave_channel("LEAVE", struct LeaveChannelReq {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// Block chatroom. Cannot rejoin chatroom if true.
            pub block: bool,
        }) -> struct LeaveChannelRes {
            /// Last token(?) id
            #[serde(rename = "lastTokenId")]
            pub last_token_id: i64,
        };

        pub fn update_channel("UPDATECHAT", struct UpdateChannelReq {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            #[serde(rename = "pushAlert")]
            pub push_alert: bool,
        });

        pub fn set_channel_meta("SETMETA", struct SetMetaReq<'a> {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// Meta type. See `structs/chatroom.rs` ChatroomMetaType for predefined types.
            #[serde(rename = "type")]
            pub meta_type: i8,

            /// Json or String content. Different depending on type.
            pub content: &'a str,
        }) -> struct SetMetaRes {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// Updated chatroom meta item.
            pub meta: ChannelMeta,
        };

        pub fn channel_info("CHATINFO", ChannelInfoReq) -> ChannelInfoRes;

        pub fn chat_on_channel("CHATONROOM", ChatOnChannelReq) -> ChatOnChannelRes;

        pub fn get_all_users("GETMEM", struct GetAllUsersReq {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,
        }) -> struct GetAllUsersRes {
            /// User list
            pub members: Vec<UserVariant>,
        };

        pub fn get_users("MEMBER", struct GetUsersReq<'a> {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// List of requesting user id list
            #[serde(rename = "memberIds")]
            pub user_ids: &'a [i64],
        }) -> struct GetUsersRes {
            /// Chatroom id
            #[serde(rename = "chatId")]
            pub chat_id: i64,

            /// List of requested user list
            #[serde(rename = "members")]
            pub members: Vec<UserVariant>,
        };

        pub fn get_trailer("GETTRAILER", struct GetTrailerReq<'a> {
            /// Media key
            #[serde(rename = "k")]
            pub key: &'a str,

            /// Chat type
            #[serde(rename = "t")]
            pub chat_type: i32,
        }) -> struct GetTrailerRes {
            /// Host (Unused(?))
            #[serde(rename = "h")]
            pub host: String,

            /// Port
            #[serde(rename = "p")]
            pub port: i32,

            /// VHost
            #[serde(rename = "vh")]
            pub vhost: String,

            /// VHost (ipv6)
            #[serde(rename = "vh6")]
            pub vhost6: i32,
        };
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

    pub fn sync_chat_stream(
        self,
        req: &SyncChatReq,
    ) -> impl Stream<Item = RequestResult<SyncChatRes>> + 'a {
        let SyncChatReq {
            chat_id,
            mut current,
            count,
            max,
        } = *req;

        try_stream! {
            let mut is_ok = false;
            while !is_ok {
                let res = self.sync_chat(&SyncChatReq {
                    chat_id,
                    current,
                    count,
                    max,
                }).await?;

                match res.chatlogs.as_ref().and_then(|chatlogs| chatlogs.last()) {
                    Some(last) => {
                        current = last.log_id;
                        is_ok = res.is_ok;
                    }

                    None => is_ok = true,
                }

                yield res;
            }
        }
    }
}
