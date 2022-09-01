use serde::{Deserialize, Serialize};

/// ConnectionData includes ports, connection configuartion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionData {
    /// Keep interval(?) when background
    #[serde(rename = "bgKeepItv")]
    pub background_keep_interval: i32,

    /// Reconnect interval when background
    #[serde(rename = "bgReconnItv")]
    pub background_reconnect_interval: i32,

    /// Ping interval when background
    #[serde(rename = "bgPingItv")]
    pub background_interval: i32,

    /// Ping interval
    #[serde(rename = "fgPingItv")]
    pub ping_interval: i32,

    /// Request timeout
    #[serde(rename = "reqTimeout")]
    pub request_timeout: i32,

    /// Encrypt type, but loco_protocol only supports 2 and server seems to use 2 only.
    #[serde(rename = "encType")]
    pub encrypt_type: i32,

    /// Connection timeout
    #[serde(rename = "connTimeout")]
    pub connection_timeout: i32,

    /// Header timeout
    #[serde(rename = "recvHeaderTimeout")]
    pub receive_header_timeout: i32,

    /// IN segment timeout
    #[serde(rename = "inSegTimeout")]
    pub in_seg_timeout: i32,

    /// OUT segment timeout
    #[serde(rename = "outSegTimeout")]
    pub out_seg_timeout: i32,

    /// TCP buffer size
    #[serde(rename = "blockSendBufSize")]
    pub block_send_buffer_size: i32,

    /// Port list
    pub ports: Vec<i32>,
}

/// HostData includes host list
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostData {
    /// Unknown
    pub ssl: Vec<String>,

    /// Unknown
    pub v2sl: Vec<String>,

    /// Usable host list
    pub lsl: Vec<String>,

    /// Usable host list (ipv6)
    pub lsl6: Vec<String>,
}
