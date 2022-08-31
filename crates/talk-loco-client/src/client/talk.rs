use talk_loco_command::{request, response};

use crate::LocoCommandSession;

use super::async_client_method;

#[derive(Debug)]
pub struct TalkClient<'a>(pub &'a LocoCommandSession);

impl TalkClient<'_> {
    async_client_method!(login, "LOGINLIST", request::chat::LoginListReq => response::chat::LoginListRes);

    async_client_method!(load_channel_list, "LCHATLIST", request::chat::LChatListReq => response::chat::LChatListRes);

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

    async_client_method!(channel_users, "GETMEM", request::chat::GetMemReq => response::chat::GetMemRes);

    async_client_method!(user_info, "MEMBER", request::chat::MemberReq => response::chat::MemberRes);

    async_client_method!(update_channel, "UPDATECHAT", request::chat::UpdateChatReq);

    async_client_method!(get_trailer, "GETTRAILER", request::chat::GetTrailerReq => response::chat::GetTrailerRes);
}
