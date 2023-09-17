use futures_lite::{AsyncRead, AsyncWrite};
use loco_protocol::command::Method;
use serde::{Deserialize, Serialize};

use crate::{LocoClient, RequestResult};

use super::request_simple;

#[derive(Debug)]
pub struct CheckinClient<T>(LocoClient<T>);

impl<T> CheckinClient<T> {
    pub const fn new(client: LocoClient<T>) -> Self {
        Self(client)
    }

    pub fn into_inner(self) -> LocoClient<T> {
        self.0
    }
}

impl<T: AsyncRead + AsyncWrite> CheckinClient<T> {
    pub async fn checkin(&mut self, req: &CheckinReq<'_>) -> RequestResult<CheckinRes>
    where
        T: Unpin,
    {
        request_simple(&mut self.0, Method::new("CHECKIN").unwrap(), req).await
    }
}

/// Request loco server host data
#[derive(Debug, Clone, Serialize)]
pub struct CheckinReq<'a> {
    /// Client user id. Login to acquire.
    #[serde(rename = "userId")]
    pub user_id: i64,

    /// Current OS (win32, android, mac, etc.)
    pub os: &'a str,

    /// Network type (0 for wired)
    #[serde(rename = "ntype")]
    pub net_type: i16,

    /// Official app version
    #[serde(rename = "appVer")]
    pub app_version: &'a str,

    /// Network MCCMNC ("999" on pc)
    #[serde(rename = "MCCMNC")]
    pub mccmnc: &'a str,

    #[serde(rename = "lang")]
    pub language: &'a str,

    #[serde(rename = "countryISO")]
    pub country_iso: &'a str,

    /// Subdevice(PC, Tablet) or not
    #[serde(rename = "useSub")]
    pub use_sub: bool,
}

/// Answer loco server information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckinRes {
    /// Loco server ip
    pub host: String,

    /// Loco server ip(v6)
    pub host6: String,

    /// Loco server port
    pub port: i32,

    /// Info cache expire time(?)
    #[serde(rename = "cacheExpire")]
    pub cache_expire: i32,

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
