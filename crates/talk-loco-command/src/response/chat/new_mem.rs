use crate::structs::chat::Chatlog;
use serde::{Deserialize, Serialize};

/// Send when new user join.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewMem {
    /// Join feed chat.(?)
    #[serde(rename = "chatLog")]
    pub chat_log: Chatlog,
}
