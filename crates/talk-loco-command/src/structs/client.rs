use serde::{Deserialize, Serialize};

/// Describes response status info
///
/// Compare these predefined status before to process data
#[derive(Debug, PartialEq, Eq)]
#[repr(i16)]
pub enum Status {
    Success = 0,
    Fail = -500,
    Restricted = -997,
    Maintenance = -9797,
    NotLogon = -201,
}

/// Common client info struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientInfo {
    /// Current OS (win32, android, mac, etc.)
    pub os: String,

    /// Network type (0 for wired)
    #[serde(rename = "ntype")]
    pub net_type: i16,

    /// Official app version
    #[serde(rename = "appVer")]
    pub app_version: String,

    /// Network MCCMNC ("999" on pc)
    #[serde(rename = "MCCMNC")]
    pub mccmnc: String,
}
