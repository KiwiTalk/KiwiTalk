use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalConfiguration {
    language: Language,
}

impl Default for GlobalConfiguration {
    fn default() -> Self {
        Self {
            language: Language::Auto,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Language {
    Auto,
    Fixed(String),
}

impl Default for Language {
    fn default() -> Self {
        Self::Auto
    }
}
