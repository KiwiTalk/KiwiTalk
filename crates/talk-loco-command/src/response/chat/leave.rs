use serde::{Deserialize, Serialize};

/// Leave chatroom
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveRes {
    /// Last token(?) id
    #[serde(rename = "lastTokenId")]
    pub last_token_id: i64,
}
