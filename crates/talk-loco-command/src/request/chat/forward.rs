use serde::{Deserialize, Serialize};

use crate::request;

/// Forward chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForwardReq {
    /// [request::chat::Write] content to forward
    #[serde(flatten)]
    pub content: request::chat::WriteReq,
}
