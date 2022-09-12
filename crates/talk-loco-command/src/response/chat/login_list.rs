use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use super::LChatListRes;

/// Contains userId, tokens, chatroom list.
/// The purposes of tokens, revisions are unknown yet.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginListRes {
    /// Logon user id
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(flatten)]
    pub chat_list: LChatListRes,

    /// Oldest chat id (?)
    #[serde(rename = "minLogId")]
    pub min_log_id: Option<i64>,

    /// Unknown (Mobile only)
    pub revision: Option<i32>,

    /// Revision(?) Info (Json) (Mobile only)
    #[serde(rename = "revisionInfo")]
    pub revision_info: Option<String>,

    /// Unknown
    pub sb: i32,

    /// 6 bytes binary
    #[serde(with = "serde_bytes")]
    pub rp: Vec<u8>,
    
    /// Unknown
    #[serde(rename = "pkUpdate")]
    pub pk_update: Option<bool>,

    /// Unknown
    #[serde(rename = "pkToken")]
    pub pk_token: Option<i64>,
}
