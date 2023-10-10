use reqwest::Method;
use serde::{Deserialize, Serialize};

use crate::{client::ApiClient, read_simple_response, ApiResult};

#[derive(Debug, Clone, Deserialize)]
pub struct DiffFriend {
    #[serde(rename = "userId")]
    pub user_id: u64,

    #[serde(rename = "nickName")]
    pub nickname: String,

    #[serde(rename = "type")]
    pub user_type: i32,

    #[serde(rename = "userType")]
    pub user_category: i32,

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
pub struct FriendsDiff {
    pub total_count: u32,
    pub deleted_ids: Vec<u64>,
    pub added_friends: Vec<DiffFriend>,
}

impl FriendsDiff {
    pub async fn request(client: ApiClient<'_>, ids: &[u64]) -> ApiResult<Self> {
        #[derive(Serialize)]
        struct Form<'a> {
            friend_ids: &'a str,
            #[serde(rename = "type")]
            ty: &'a str,
        }

        read_simple_response(
            client
                .request(Method::POST, "friends/diff.json")?
                .form(&Form {
                    friend_ids: &serde_json::to_string(ids).unwrap(),
                    ty: "a",
                })
                .send()
                .await?,
        )
        .await
    }
}
