pub mod channel;

use std::error::Error;

use self::channel::ChannelEvent;

#[derive(Debug)]
pub enum ClientEvent {
    /// Channel event
    Channel { id: i64, event: ChannelEvent },

    /// Server switch request
    SwitchServer,

    /// Kickout reason
    Kickout(i16),

    Error(Box<dyn Error + Send + Sync>)
}
