use reqwest::{Client, Method, RequestBuilder, Url};
use serde::Deserialize;

use crate::{
    config::Config, credential::Credential, fill_api_headers, fill_credential,
    read_simple_response, ApiResult,
};

#[derive(Debug, Clone)]
pub struct AccountApi<'a> {
    base: Url,

    config: Config<'a>,

    credential: Credential<'a>,

    client: Client,
}

impl<'a> AccountApi<'a> {
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
            .join("account")
            .unwrap()
            .join(end_point)
            .unwrap()
    }

    pub async fn more_settings(self) -> ApiResult<MoreSettings> {
        read_simple_response(
            self.create_request(Method::GET, "more_settings.json")
                .send()
                .await?,
        )
        .await
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct MoreSettings {
    pub since: u64,

    #[serde(rename = "serviceUserId")]
    pub service_user_id: u64,

    #[serde(rename = "accountId")]
    pub account_id: u64,
    #[serde(rename = "accountDisplayId")]
    pub accuont_display_id: String,
    #[serde(rename = "hashedAccountId")]
    pub hashed_account_id: String,

    #[serde(rename = "pstnNumber")]
    pub pstn_number: String,
    #[serde(rename = "formattedPstnNumber")]
    pub formatted_pstn_number: String,
    #[serde(rename = "nsnNumber")]
    pub nsn_number: String,
    #[serde(rename = "formattedNsnNumber")]
    pub formatted_nsn_number: String,

    #[serde(rename = "emailAddress")]
    pub email_address: String,
    #[serde(rename = "emailVerified")]
    pub email_verified: bool,

    pub uuid: String,
    #[serde(rename = "uuidSearchable")]
    pub uuid_serachable: bool,
    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: String,
    #[serde(rename = "fullProfileImageUrl")]
    pub full_profile_image_url: String,
    #[serde(rename = "originalProfileImageUrl")]
    pub original_profile_image_url: String,

    #[serde(rename = "statusMessage")]
    pub status_message: String,
}
