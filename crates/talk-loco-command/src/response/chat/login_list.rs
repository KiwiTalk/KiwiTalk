use serde::{Deserialize, Serialize};

use super::LChatListRes;

/// Contains userId, tokens, chatroom list.
/// The purposes of tokens, revisions are unknown yet.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginListRes {
    /// Logon user id
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(flatten)]
    pub chat_list: LChatListRes,

    /// Deleted chatroom ids(?)
    #[serde(rename = "delChatIds")]
    pub deleted_chat_ids: Vec<i64>,

    /// Unknown
    pub eof: bool,

    /// Latest chatroom id
    #[serde(rename = "lastChatId", skip_serializing_if = "Option::is_none")]
    pub last_chat_id: Option<i64>,

    /// Latest token(Unknown) id
    #[serde(rename = "lastTokenId")]
    pub last_token_id: i64,

    /// Oldest chat id (?)
    #[serde(rename = "minLogId")]
    pub min_log_id: i64,

    /// Latest token(Unknown)(?)
    #[serde(rename = "ltk")]
    pub last_token: i64,

    /// Latest block token(Unknown)(?)
    #[serde(rename = "lbk")]
    pub last_block_token: i64,

    /// Latest mcm(?) revision
    #[serde(rename = "mcmRevision")]
    pub mcm_revision: i64,

    /// Unknown
    pub revision: i32,

    /// Revision(?) Info (Json)
    #[serde(rename = "revisionInfo")]
    pub revision_info: String,

    /// Unknown
    pub sb: i32,
    // Unknown, Unknown item type
    //pub kc: Vec<()>
}
