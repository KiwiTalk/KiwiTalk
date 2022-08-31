use crate::structs::connection::{ConnectionData, HostData};
use serde::{Deserialize, Serialize};

/// Answer checkin server information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetConfRes {
    /// Unknown
    pub revision: i32,

    /// Ceullar (3g) config
    #[serde(rename = "3g")]
    pub ceullar: ConnectionData,

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
