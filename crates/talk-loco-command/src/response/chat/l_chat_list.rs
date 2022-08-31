use crate::structs::channel_info::ChannelListData;
use serde::{Deserialize, Serialize};

/// Request every chatroom list
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LChatListRes {
    #[serde(rename = "chatDatas")]
    pub chat_datas: Vec<ChannelListData>,
}
