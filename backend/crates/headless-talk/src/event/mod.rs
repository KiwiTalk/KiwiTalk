pub mod channel;

use self::channel::ChannelEvent;

#[derive(Debug, Clone)]
pub enum ClientEvent {
    /// Channel event
    Channel { id: i64, event: ChannelEvent },

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),
}
