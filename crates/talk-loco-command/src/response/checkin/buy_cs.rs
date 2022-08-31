use serde::{Deserialize, Serialize};

/// Call server information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuyCSRes {
    /// Call server ip
    #[serde(rename = "cshost")]
    pub cs_host: String,

    /// Call server ip(v6)
    #[serde(rename = "cshost6")]
    pub cs_host6: String,

    /// Call server port
    #[serde(rename = "csport")]
    pub cs_port: i32,

    /// Unknown server ip
    #[serde(rename = "vsshost")]
    pub vss_host: String,

    /// Unknown server ip(v6)
    #[serde(rename = "vsshost6")]
    pub vss_host6: String,

    /// Unknown server port
    #[serde(rename = "vssport")]
    pub vss_port: i32,
}
