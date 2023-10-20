use serde::Deserialize;

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Response {
    #[serde(rename = "vh")]
    pub vhost: String,

    #[serde(rename = "vh6")]
    pub vhost6: String,

    #[serde(rename = "p")]
    pub port: i32,
}
