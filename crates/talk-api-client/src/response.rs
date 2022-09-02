use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TalkStatusResponse<T> {
    pub status: i32,

    #[serde(flatten)]
    pub data: Option<T>,
}
