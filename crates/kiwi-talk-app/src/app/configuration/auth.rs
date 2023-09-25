use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AuthConfiguration {
    SaveAccount { email: String },
    AutoLogin { email: String, token: String },
}
