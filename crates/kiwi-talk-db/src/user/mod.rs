use once_cell::sync::Lazy;
use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

static MIGRATIONS: Lazy<Migrations<'static>> = Lazy::new(|| {
    Migrations::new(vec![M::up(include_str!(
        "./migrations/202210050951_user.sql"
    ))])
});

#[derive(Debug)]
pub struct UserConnection {
    connection: Connection,
}

impl UserConnection {
    pub fn new(connection: Connection) -> Self {
        Self {
            connection
        }
    }

    pub fn migrate_to_latest(&mut self) -> rusqlite_migration::Result<()> {
        MIGRATIONS.to_latest(&mut self.connection)
    }

    pub fn channel(&self) -> ChannelEntry<'_> {
        ChannelEntry(&self.connection)
    }

    pub fn into_inner(self) -> Connection {
        self.connection
    }
}

pub struct ChannelEntry<'a>(&'a Connection);

impl<'a> ChannelEntry<'a> {

}

#[cfg(test)]
mod tests {
    use super::MIGRATIONS;

    #[test]
    fn migrations_test() {
        assert!(MIGRATIONS.validate().is_ok());
    }
}
