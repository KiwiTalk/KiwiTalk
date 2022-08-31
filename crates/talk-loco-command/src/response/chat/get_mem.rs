use crate::structs::user::UserVariant;
use serde::{Deserialize, Serialize};

/// Responses simplified member list of chatroom.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetMemRes {
    /// User list
    pub members: Vec<UserVariant>,
}
