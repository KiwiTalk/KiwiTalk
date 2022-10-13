pub mod model;

pub mod normal;
pub mod open;

use rusqlite::Connection;

#[derive(Debug, Clone, Copy)]
pub struct ChannelEntry<'a>(pub &'a Connection);

impl<'a> ChannelEntry<'a> {}

