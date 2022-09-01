use serde::{Deserialize, Serialize};

/// Update client status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetStReq {
    /// Status
    ///
    /// * Unlocked = 1
    /// * Locked = 2
    #[serde(rename = "st")]
    pub status: i8,
}
