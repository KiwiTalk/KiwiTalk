pub mod model;

use super::{ChannelEntry, ChannelUserEntry};

#[derive(Debug, Clone, Copy)]
pub struct NormalChannelEntry<'a>(pub ChannelEntry<'a>);

impl<'a> NormalChannelEntry<'a> {
    
}

#[derive(Debug, Clone, Copy)]
pub struct NormalUserEntry<'a>(pub ChannelUserEntry<'a>);

impl<'a> NormalUserEntry<'a> {}
