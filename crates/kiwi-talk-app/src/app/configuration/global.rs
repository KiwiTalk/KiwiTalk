use serde::{Deserialize, Serialize};
use super::locale::Locale;
use super::auth::AuthConfiguration;

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
