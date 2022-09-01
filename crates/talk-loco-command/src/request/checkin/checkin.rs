use crate::structs::client::ClientInfo;
use serde::{Deserialize, Serialize};

/// Request loco server host data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckinReq {
    /// Client user id. Login to acquire.
    #[serde(rename = "userId")]
    pub user_id: i64,

    #[serde(flatten)]
    pub client: ClientInfo,

    #[serde(rename = "lang")]
    pub language: String,

    #[serde(rename = "countryISO")]
    pub country_iso: String,

    /// Subdevice(PC, Tablet) or not
    #[serde(rename = "useSub")]
    pub use_sub: bool,
}
