use reqwest::{header, Client, Method, RequestBuilder, Url};
use serde::Deserialize;

use crate::{config::Config, credential::Credential, read_simple_response, ApiResult};

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
        let user_agent = self.config.get_user_agent();

        self.client
            .request(method, self.create_url(end_point))
            .header(header::USER_AGENT, user_agent)
            .header(
                "A",
                format!(
                    "{}/{}/{}",
                    self.config.agent.agent(),
                    self.config.version,
                    self.config.language
                ),
            )
            .header(
                header::AUTHORIZATION,
                format!(
                    "{}-{}",
                    self.credential.access_token, self.credential.device_uuid
                ),
            )
            .header(header::ACCEPT, "*/*")
            .header(header::ACCEPT_LANGUAGE, self.config.language)
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

    pub async fn request_my_profile(self) -> ApiResult<MeProfile> {
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
