pub mod channel;

use serde::{Serialize, Deserialize};

use crate::channel::ChannelId;

use self::channel::ChannelEvent;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
pub enum ClientEvent {
    /// Channel event
    Channel { id: ChannelId, event: ChannelEvent },

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),
}
