pub mod channel;
pub mod chat;

use channel::{open::OpenChannelEntry, normal::NormalChannelEntry, ChannelEntry};
use once_cell::sync::Lazy;
use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

use crate::chat::ChatEntry;

static MIGRATIONS: Lazy<Migrations<'static>> = Lazy::new(|| {
    Migrations::new(vec![M::up(include_str!(
        "./migrations/202210120952_db.sql"
    ))])
});

#[derive(Debug)]
pub struct KiwiTalkConnection {
    connection: Connection,
}

impl KiwiTalkConnection {
    pub const fn new(connection: Connection) -> Self {
        Self { connection }
    }

    pub fn migrate_to_latest(&mut self) -> rusqlite_migration::Result<()> {
        MIGRATIONS.to_latest(&mut self.connection)
    }

    pub const fn channel(&self) -> ChannelEntry<'_> {
        ChannelEntry(&self.connection)
    }

    pub const fn chat(&self) -> ChatEntry<'_> {
        ChatEntry(&self.connection)
    }

    pub fn into_inner(self) -> Connection {
        self.connection
    }
}

#[cfg(test)]
mod tests {
    use super::MIGRATIONS;

    #[test]
    fn migrations_test() {
        assert!(MIGRATIONS.validate().is_ok());
    }
}
