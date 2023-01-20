use async_stream::try_stream;
use futures::Stream;
use talk_loco_command::{request, response};

use crate::LocoCommandSession;

use super::{async_client_method, ClientRequestResult};

#[derive(Debug)]
pub struct TalkClient<'a>(pub &'a LocoCommandSession);

impl TalkClient<'_> {
    async_client_method!(login, "LOGINLIST", request::chat::LoginListReq => response::chat::LoginListRes);

    async_client_method!(load_channel_list, "LCHATLIST", request::chat::LChatListReq => response::chat::LChatListRes);
    pub fn channel_list_stream(
        &self,
        mut last_token_id: i64,
        mut last_chat_id: Option<i64>,
    ) -> impl Stream<Item = ClientRequestResult<response::chat::LChatListRes>> + '_ {
        try_stream! {
            let mut eof = false;

            while !eof {
                let res = self.load_channel_list(&request::chat::LChatListReq {
                    chat_ids: vec![],
                    max_ids: vec![],
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

    async_client_method!(set_status, "SETST", request::chat::SetStReq);

    async_client_method!(channel_info, "CHATINFO", request::chat::ChatInfoReq => response::chat::ChatInfoRes);

    async_client_method!(chat_on_channel, "CHATONROOM", request::chat::ChatOnRoomReq => response::chat::ChatOnRoomRes);

    async_client_method!(write, "WRITE", request::chat::WriteReq => response::chat::WriteRes);

    async_client_method!(forward, "FORWARD", request::chat::ForwardReq => response::chat::ForwardRes);

    async_client_method!(delete_chat, "DELETEMSG", request::chat::DeleteMsgReq => response::chat::DeleteMsgRes);

    async_client_method!(leave, "LEAVE", request::chat::LeaveReq => response::chat::LeaveRes);

    async_client_method!(read_chat, "NOTIREAD", request::chat::NotiReadReq);

    async_client_method!(set_meta, "SETMETA", request::chat::SetMetaReq => response::chat::SetMetaRes);

    async_client_method!(sync_chat, "SYNCMSG", request::chat::SyncMsgReq => response::chat::SyncMsgRes);
    pub fn sync_chat_stream(
        &self,
        req: &request::chat::SyncMsgReq,
    ) -> impl Stream<Item = ClientRequestResult<response::chat::SyncMsgRes>> + '_ {
        let request::chat::SyncMsgReq {
            chat_id,
            mut current,
            count,
            max,
        } = *req;

        try_stream! {
            let mut is_ok = false;
            while !is_ok {
                let res = self.sync_chat(&request::chat::SyncMsgReq {
                    chat_id,
                    current,
                    count,
                    max,
                }).await?;

                match res.chatlogs.as_ref().map(|chatlogs| chatlogs.last()).flatten() {
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

    async_client_method!(channel_users, "GETMEM", request::chat::GetMemReq => response::chat::GetMemRes);

    async_client_method!(user_info, "MEMBER", request::chat::MemberReq => response::chat::MemberRes);

    async_client_method!(update_channel, "UPDATECHAT", request::chat::UpdateChatReq);

    async_client_method!(get_trailer, "GETTRAILER", request::chat::GetTrailerReq => response::chat::GetTrailerRes);
}
