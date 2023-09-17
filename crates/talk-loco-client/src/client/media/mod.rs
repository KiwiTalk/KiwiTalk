pub mod io;

use futures_lite::{AsyncRead, AsyncWrite};
use loco_protocol::command::Method;
use serde::{Deserialize, Serialize};

use crate::{LocoClient, RequestResult};

use self::io::{MediaSink, MediaStream};

use super::request_simple;

#[derive(Debug)]
pub struct MediaClient<T>(LocoClient<T>);

impl<T> MediaClient<T> {
    pub const fn new(client: LocoClient<T>) -> Self {
        Self(client)
    }

    pub fn into_inner(self) -> LocoClient<T> {
        self.0
    }
}

impl<T: AsyncRead + AsyncWrite + Unpin> MediaClient<T> {
    pub async fn post(self) -> RequestResult<MediaSink<T>> {
        todo!()
    }

    pub async fn post_multi(self) -> RequestResult<MediaSink<T>> {
        todo!()
    }

    pub async fn download(mut self, req: &DownReq<'_>) -> RequestResult<MediaStream<T>> {
        let DownRes { size } =
            request_simple::<DownRes>(&mut self.0, Method::new("DOWN").unwrap(), req).await?;

        Ok(MediaStream {
            remaining: size,
            inner: self.0.into_inner(),
        })
    }

    pub async fn download_mini(mut self, req: &MiniReq<'_>) -> RequestResult<MediaStream<T>> {
        let DownRes { size } =
            request_simple::<DownRes>(&mut self.0, Method::new("MINI").unwrap(), req).await?;

        Ok(MediaStream {
            remaining: size,
            inner: self.0.into_inner(),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownReq<'a> {
    #[serde(rename = "k")]
    pub key: &'a str,

    #[serde(rename = "c")]
    pub channel_id: i64,

    #[serde(rename = "o")]
    pub offset: i64,

    pub rt: bool,

    #[serde(flatten)]
    pub client: MediaClientInfo<'a>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiniReq<'a> {
    #[serde(rename = "k")]
    pub key: &'a str,

    #[serde(rename = "c")]
    pub channel_id: i64,

    #[serde(rename = "o")]
    pub offset: i64,

    #[serde(rename = "w")]
    pub width: i32,

    #[serde(rename = "h")]
    pub height: i32,

    #[serde(flatten)]
    pub client: MediaClientInfo<'a>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownRes {
    #[serde(rename = "s")]
    pub size: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaClientInfo<'a> {
    #[serde(rename = "u")]
    pub user_id: i64,

    #[serde(rename = "os")]
    pub agent: &'a str,

    #[serde(rename = "av")]
    pub app_version: &'a str,

    #[serde(rename = "nt")]
    pub net_type: i16,

    #[serde(rename = "mm")]
    pub mccmnc: &'a str,
}
