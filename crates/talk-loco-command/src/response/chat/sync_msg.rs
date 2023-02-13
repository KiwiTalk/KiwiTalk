use crate::structs::chat::Chatlog;
use serde::{Deserialize, Serialize};

/// Responses chatlogs between "current" and "max". Chatlog list sliced to 300 or "max" value max.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncMsgRes {
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
}
