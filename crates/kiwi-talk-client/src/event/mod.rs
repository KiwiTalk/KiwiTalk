pub mod channel;

use serde::Serialize;

use crate::channel::ChannelId;

use self::channel::ChannelEvent;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum ClientEvent {
    /// Channel event
    Channel { id: ChannelId, event: ChannelEvent },

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),
}
