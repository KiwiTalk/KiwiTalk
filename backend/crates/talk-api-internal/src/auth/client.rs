use reqwest::{Method, RequestBuilder};
use serde::Serialize;

use crate::{client::TalkHttpClient, RequestResult};

use super::xvc::XvcHasher;

#[derive(Debug, Clone)]
pub struct AuthClient<'a, Xvc> {
    pub device: Device<'a>,
    pub xvc: Xvc,
    inner: TalkHttpClient<'a>,
}

impl<'a, Xvc: XvcHasher> AuthClient<'a, Xvc> {
    pub const fn new(device: Device<'a>, xvc: Xvc, inner: TalkHttpClient<'a>) -> Self {
        Self { device, xvc, inner }
    }

    pub fn request(
        self,
        method: Method,
        end_point: &str,
        email: &str,
    ) -> RequestResult<RequestBuilder> {
        let user_agent = self.inner.config.get_user_agent();

        let xvc = hex::encode(&self.xvc.full_xvc_hash(self.device.uuid, &user_agent, email)[..8]);

        Ok(self.inner.request(method, end_point)?.header("X-VC", xvc))
    }
}

#[derive(Debug, Clone, Copy, Serialize)]
pub struct Device<'a> {
    #[serde(rename = "device_name")]
    pub name: &'a str,

    #[serde(rename = "model_name")]
    pub model: Option<&'a str>,

    #[serde(rename = "device_uuid")]
    pub uuid: &'a str,
}
