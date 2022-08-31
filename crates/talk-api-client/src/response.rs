use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TalkStatusResponse<T> {
    pub status: i32,

    #[serde(flatten, skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}
