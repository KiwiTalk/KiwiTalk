use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Locale {
    #[default]
    Auto,

    Fixed(String),
}
