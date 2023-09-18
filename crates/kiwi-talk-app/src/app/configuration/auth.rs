use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AuthConfiguration {
    None,
    SaveAccount {
        email: String,
    },
    AutoLogin {
        email: String,
        token: String,
    }
}

impl Default for AuthConfiguration {
    fn default() -> Self {
        Self::None
    }
}
