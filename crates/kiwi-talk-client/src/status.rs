use serde::{Deserialize, Serialize};

#[repr(i32)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status")]
pub enum ClientStatus {
    Unlocked = 1,
    Locked = 2,
}
