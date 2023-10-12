use reqwest::Method;
use serde::Deserialize;

use crate::{client::ApiClient, read_simple_response, ApiResult};

#[derive(Debug, Clone, Deserialize)]
pub struct MeProfile {
    pub nickname: String,

    #[serde(rename = "userId")]
    pub user_id: u64,

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

#[derive(Debug, Clone, Deserialize)]
pub struct Me {
    pub profile: MeProfile,
}

impl Me {
    pub async fn request(client: ApiClient<'_>) -> ApiResult<Self> {
        read_simple_response(
            &client
                .request(Method::GET, "profile3/me.json")?
                .send()
                .await?
                .bytes()
                .await?,
        )
    }
}
#[derive(Debug, Clone, Deserialize)]
pub struct FriendProfile {
    #[serde(rename = "userId")]
    pub user_id: u64,

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

#[derive(Debug, Clone, Deserialize)]
pub struct FriendInfo {
    pub profile: FriendProfile,
}

impl FriendInfo {
    pub async fn request(client: ApiClient<'_>, id: u64) -> ApiResult<Self> {
        read_simple_response(
            &client
                .request(Method::GET, "profile3/friend_info.json")?
                .query(&[("id", id)])
                .send()
                .await?
                .bytes()
                .await?,
        )
    }
}
