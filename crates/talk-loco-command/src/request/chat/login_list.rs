use crate::structs::client::ClientInfo;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

use super::LChatListReq;

/// Login to loco server
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginListReq {
    #[serde(flatten)]
    pub client: ClientInfo,

    /// Protocol version. "1" on mobile and "1.0" on PC.
    #[serde(rename = "prtVer")]
    pub protocol_version: String,

    /// Device uuid String. Usually hashed unique id.
    #[serde(rename = "duuid")]
    pub device_uuid: String,

    /// OAuth access token
    #[serde(rename = "oauthToken")]
    pub oauth_token: String,

    #[serde(rename = "lang")]
    pub language: String,

    /// Device type (PC Only(?)) (2 for pc)
    #[serde(rename = "dtype")]
    pub device_type: Option<i8>,

    /// Unknown (Mobile only)
    pub revision: Option<i32>,

    /// 6 bytes binary (0x?? 0x?? 0xff 0xff 0x?? 0x??)
    #[serde(with = "serde_bytes")]
    pub rp: Vec<u8>,

    /// PC status (PC only) (Same with SETST status?)
    #[serde(rename = "pcst")]
    pub pc_status: Option<i32>,

    #[serde(flatten)]
    pub chat_list: LChatListReq,

    /// Unknown
    #[serde(rename = "lbk")]
    pub last_block_token: i32,

    /// background checking(?) (Mobile only)
    #[serde(rename = "bg")]
    pub background: Option<bool>,
}
