use futures_lite::{AsyncRead, AsyncWrite};
use loco_protocol::command::Method;
use serde::{Deserialize, Serialize};

use crate::{LocoClient, RequestResult};

use super::request_simple;

#[derive(Debug)]
pub struct BookingClient<T>(LocoClient<T>);

impl<T> BookingClient<T> {
    pub const fn new(client: LocoClient<T>) -> Self {
        Self(client)
    }

    pub fn into_inner(self) -> LocoClient<T> {
        self.0
    }
}

impl<T: AsyncRead + AsyncWrite> BookingClient<T> {
    pub async fn get_conf(&mut self, req: &GetConfReq<'_>) -> RequestResult<GetConfRes>
    where
        T: Unpin,
    {
        request_simple(&mut self.0, Method::new("GETCONF").unwrap(), req).await
    }
}

/// Request checkin server information
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct GetConfReq<'a> {
    /// Network MCCMNC
    #[serde(rename = "MCCMNC")]
    pub mccmnc: &'a str,

    /// Current OS (win32, android, mac, etc.)
    pub os: &'a str,

    /// Device model (mobile only) leave it empty if it's not mobile device.
    pub model: &'a str,
}

/// Answer checkin server information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetConfRes {
    /// Unknown
    pub revision: i32,

    /// Cellular (3g) config
    #[serde(rename = "3g")]
    pub cellular: ConnectionData,

    /// WiFi, wired config
    pub wifi: ConnectionData,

    /// Contains Checkin host
    pub ticket: HostData,

    /// voice / video talk configuration(?)
    pub trailer: Trailer,

    /// voice / video talk high resolution configuration(?)
    #[serde(rename = "trailer.h")]
    pub trailer_high: TrailerHigh,
}

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

    /// Encrypt type, but crate loco_protocol only supports 2 and server seems to use 2 only.
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

/// Additional config
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trailer {
    #[serde(rename = "tokenExpireTime")]
    pub token_expire_time: i32,

    pub resolution: i32,

    #[serde(rename = "resolutionHD")]
    pub resolution_hd: i32,

    #[serde(rename = "compRatio")]
    pub compress_ratio: i8,

    #[serde(rename = "compRatioHD")]
    pub compress_ratio_hd: i8,

    #[serde(rename = "downMode")]
    pub down_mode: i8,

    /// Concurrent file download limit
    #[serde(rename = "concurrentDownLimit")]
    pub concurrent_down_limit: i16,

    /// Concurrent file upload limit
    #[serde(rename = "concurrentUpLimit")]
    pub concurrent_up_limit: i16,

    #[serde(rename = "maxRelaySize")]
    pub max_relay_size: i32,

    #[serde(rename = "downCheckSize")]
    pub down_check_size: i32,

    /// Maximium attachment upload size
    #[serde(rename = "upMaxSize")]
    pub up_max_size: i32,

    #[serde(rename = "videoUpMaxSize")]
    pub video_up_max_size: i32,

    #[serde(rename = "vCodec")]
    pub video_codec: i8,

    #[serde(rename = "vFps")]
    pub video_fps: i16,

    #[serde(rename = "aCodec")]
    pub audio_codec: i8,

    /// Period that server store uploaded files
    #[serde(rename = "contentExpireTime")]
    pub content_expire_time: i32,

    #[serde(rename = "vResolution")]
    pub video_resolution: i32,

    #[serde(rename = "vBitrate")]
    pub video_bitrate: i32,

    #[serde(rename = "aFrequency")]
    pub audio_frequency: i32,
}

/// High speed trailer configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrailerHigh {
    #[serde(rename = "vResolution")]
    pub video_resolution: i32,

    #[serde(rename = "vBitrate")]
    pub video_bitrate: i32,

    #[serde(rename = "aFrequency")]
    pub audio_frequency: i32,
}
