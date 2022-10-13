pub mod model;

use rusqlite::Connection;

#[derive(Debug, Clone, Copy)]
pub struct NormalChannelEntry<'a>(pub &'a Connection);

impl<'a> NormalChannelEntry<'a> {}

#[derive(Debug, Clone, Copy)]
pub struct NormalUserEntry<'a>(pub &'a Connection);

impl<'a> NormalUserEntry<'a> {}
