use serde::{Deserialize, Serialize};

/// Request media download server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetTrailerReq {
    /// Media key
    #[serde(rename = "k")]
    pub key: String,

    /// Chat type
    #[serde(rename = "t")]
    pub chat_type: i32,
}
