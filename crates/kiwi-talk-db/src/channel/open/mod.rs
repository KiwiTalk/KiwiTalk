pub mod model;

use rusqlite::Connection;

#[derive(Debug, Clone, Copy)]
pub struct OpenChannelEntry<'a>(pub &'a Connection);

impl<'a> OpenChannelEntry<'a> {}

#[derive(Debug, Clone, Copy)]
pub struct OpenUserEntry<'a>(pub &'a Connection);

impl<'a> OpenUserEntry<'a> {}
