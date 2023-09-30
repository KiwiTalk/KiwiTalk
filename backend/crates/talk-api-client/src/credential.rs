use serde::{Deserialize, Serialize};

/// OAuth credential data for internal talk service
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TalkAuthCredential {
    pub access_token: String,
    pub refresh_token: String,
}
