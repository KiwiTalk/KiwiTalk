use super::locale::Locale;
use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct GlobalConfiguration {
    pub locale: Locale,
}
