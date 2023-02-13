use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalConfiguration {
    pub locale: Locale,
}

impl Default for GlobalConfiguration {
    fn default() -> Self {
        Self {
            locale: Locale::Auto,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Locale {
    Auto,
    Fixed(String),
}

impl Default for Locale {
    fn default() -> Self {
        Self::Auto
    }
}
