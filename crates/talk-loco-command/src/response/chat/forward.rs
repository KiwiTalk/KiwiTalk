use serde::{Deserialize, Serialize};

use crate::structs::chat::Chatlog;

/// [crate::request::chat::ForwardReq] response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForwardRes {
    /// Fowarded message
    #[serde(rename = "chatLog")]
    pub chatlog: Chatlog,
}
