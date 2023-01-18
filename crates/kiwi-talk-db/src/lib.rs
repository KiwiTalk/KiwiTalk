pub mod channel;
pub mod chat;
pub mod model;

use channel::{
    normal::{NormalChannelEntry, NormalUserEntry},
    ChannelEntry, ChannelUserEntry,
};
use once_cell::sync::Lazy;
use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

use crate::chat::ChatEntry;

static MIGRATIONS: Lazy<Migrations<'static>> = Lazy::new(|| {
    Migrations::new(vec![M::up(include_str!(
        "./migrations/202301182212_db.sql"
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

    pub const fn user(&self) -> ChannelUserEntry<'_> {
        ChannelUserEntry(&self.connection)
    }

    pub const fn normal_channel(&self) -> NormalChannelEntry<'_> {
        NormalChannelEntry(self.channel())
    }

    pub const fn normal_user(&self) -> NormalUserEntry<'_> {
        NormalUserEntry(self.user())
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
    use rusqlite::Connection;

    use crate::KiwiTalkConnection;

    use super::MIGRATIONS;

    #[test]
    fn migrations_test() {
        assert!(MIGRATIONS.validate().is_ok());
    }

    pub fn prepare_test_database() -> Result<KiwiTalkConnection, Box<dyn std::error::Error>> {
        let mut db = KiwiTalkConnection::new(Connection::open_in_memory()?);
        db.migrate_to_latest()?;

        Ok(db)
    }
}
