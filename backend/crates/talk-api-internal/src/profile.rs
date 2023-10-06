use reqwest::{Client, Method, RequestBuilder, Url};
use serde::Deserialize;

use crate::{
    config::Config, credential::Credential, fill_api_headers, fill_credential,
    read_simple_response, ApiResult,
};

#[derive(Debug, Clone)]
pub struct ProfileApi<'a> {
    base: Url,

    config: Config<'a>,

    credential: Credential<'a>,

    client: Client,
}

impl<'a> ProfileApi<'a> {
    pub const fn new(
        base: Url,
        config: Config<'a>,
        credential: Credential<'a>,
        client: Client,
    ) -> Self {
        Self {
            base,

            config,

            credential,

            client,
        }
    }

    fn create_request(&self, method: Method, end_point: &str) -> RequestBuilder {
        fill_credential(
            fill_api_headers(
                self.client.request(method, self.create_url(end_point)),
                self.config,
            ),
            self.credential,
        )
    }

    fn create_url(&self, end_point: &str) -> Url {
        self.base
            .join(self.config.agent.agent())
            .unwrap()
            .join("profile3")
            .unwrap()
            .join(end_point)
            .unwrap()
    }

    pub async fn my_profile(self) -> ApiResult<MeProfile> {
        read_simple_response(self.create_request(Method::GET, "me.json").send().await?).await
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct MeProfile {
    #[serde(rename = "backgroundImageUrl")]
    pub background_image_url: String,
    #[serde(rename = "originalBackgroundImageUrl")]
    pub original_background_image_url: String,

    #[serde(rename = "statusMessage")]
    pub status_message: String,

    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: String,
    #[serde(rename = "fullProfileImageUrl")]
    pub full_profile_image_url: String,
    #[serde(rename = "originalProfileImageUrl")]
    pub original_profile_image_url: String,
}
