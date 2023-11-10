use serde::{Serialize, Deserialize};
use serde_with::skip_serializing_none;

#[derive(Debug, Clone, Serialize, PartialEq)]
#[skip_serializing_none]
pub struct Request<'a> {
    #[serde(rename = "memberIds")]
    pub user_ids: &'a [i64],
    
    #[serde(rename = "nickName")]
    pub nickname: Option<&'a str>,
    
    #[serde(rename = "profileImageUrl")]
    pub profile_image_url: Option<&'a str>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ResponseVariant {
    Done(Response),
    Exists(Response),
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Response {
    #[serde(rename = "chatId")]
    pub channel_id: i64,
}