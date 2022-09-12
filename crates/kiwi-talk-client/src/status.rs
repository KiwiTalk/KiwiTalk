use serde::{Deserialize, Serialize};
use talk_loco_command::request::chat::set_st;

#[repr(i32)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status")]
pub enum ClientStatus {
    Unlocked = set_st::STATUS_UNLOCKED,
    Locked = set_st::STATUS_LOCKED,
}
