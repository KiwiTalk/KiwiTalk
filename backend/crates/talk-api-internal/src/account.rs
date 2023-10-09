use reqwest::Method;
use serde::Deserialize;

use crate::{client::ApiClient, read_simple_response, ApiResult};

#[derive(Debug, Clone, Deserialize)]
pub struct MoreSettings {
    pub since: u64,

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

impl MoreSettings {
    pub async fn request(client: ApiClient<'_>) -> ApiResult<Self> {
        read_simple_response(
            client
                .request(Method::GET, "account/more_settings.json")?
                .send()
                .await?,
        )
        .await
    }
}
