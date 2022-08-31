use serde::{Deserialize, Serialize};

/// [crate::request::chat::GetTrailerReq] response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetTrailerRes {
    /// Host (Unused(?))
    #[serde(rename = "h")]
    pub host: String,

    /// Port
    #[serde(rename = "p")]
    pub port: i32,

    /// VHost
    #[serde(rename = "vh")]
    pub vhost: String,

    /// VHost (ipv6)
    #[serde(rename = "vh6")]
    pub vhost6: i32,
}
