use crate::structs::client::ClientInfo;
use serde::{Deserialize, Serialize};

/// Request call server host data.
/// Checkin response already contains call server info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuyCSReq {
    #[serde(flatten)]
    pub client: ClientInfo,

    #[serde(rename = "countryISO")]
    pub country_iso: String,
}
