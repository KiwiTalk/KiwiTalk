pub mod channel;

use crate::channel::ChannelId;

use self::channel::ChannelEvent;

#[derive(Debug, Clone)]
pub enum ClientEvent {
    /// Channel event
    Channel { id: ChannelId, event: ChannelEvent },

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),
}
