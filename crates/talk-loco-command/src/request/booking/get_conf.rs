use serde::{Deserialize, Serialize};

/// Request checkin server information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetConfReq {
    /// Network MCCMNC
    #[serde(rename = "MCCMNC")]
    pub mccmnc: String,

    /// Current OS (win32, android, mac, etc.)
    pub os: String,

    /// Device model (mobile only) leave it empty if it's not mobile device.
    pub model: String,
}
