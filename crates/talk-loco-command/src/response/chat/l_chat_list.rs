use crate::structs::channel_info::ChannelListData;
use serde::{Deserialize, Serialize};

/// Request every chatroom list
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LChatListRes {
    /// false if there is more channels to be requested with LCHATLIST
    pub eof: bool,

    /// Latest mcm(?) revision
    #[serde(rename = "mcmRevision")]
    pub mcm_revision: i64,

    /// Latest chatroom id
    #[serde(rename = "lastChatId")]
    pub last_chat_id: Option<i64>,

    /// Latest token(Unknown) id
    #[serde(rename = "lastTokenId")]
    pub last_token_id: Option<i64>,

    /// Latest token(Unknown)(?)
    #[serde(rename = "ltk")]
    pub last_token: Option<i64>,

    /// Latest block token(Unknown)(?)
    #[serde(rename = "lbk")]
    pub last_block_token: i64,

    // Unknown, Unknown item type
    //pub kc: Vec<()>

    /// Deleted chatroom ids(?)
    #[serde(rename = "delChatIds")]
    pub deleted_chat_ids: Vec<i64>,

    #[serde(rename = "chatDatas")]
    pub chat_datas: Vec<ChannelListData>,
}
