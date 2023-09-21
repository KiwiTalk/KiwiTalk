use super::auth::AuthConfiguration;
use super::locale::Locale;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalConfiguration {
    pub locale: Locale,
    pub auth: AuthConfiguration,
}

impl Default for GlobalConfiguration {
    fn default() -> Self {
        Self {
            locale: Locale::Auto,
            auth: AuthConfiguration::None,
        }
    }
}
