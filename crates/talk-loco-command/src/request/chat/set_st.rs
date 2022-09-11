use serde::{Deserialize, Serialize};

/// Update client status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetStReq {
    /// Status
    ///
    /// * Unlocked [`STATUS_UNLOCKED`]
    /// * Locked [`STATUS_LOCKED`]
    #[serde(rename = "st")]
    pub status: i32,
}

pub const STATUS_UNLOCKED: i32 = 1;
pub const STATUS_LOCKED: i32 = 2;
