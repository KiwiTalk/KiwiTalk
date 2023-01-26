pub mod channel;
pub mod chat;
pub mod model;
pub mod pool;

use once_cell::sync::Lazy;
use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

static MIGRATIONS: Lazy<Migrations<'static>> =
    Lazy::new(|| Migrations::new(vec![M::up(include_str!("./migrations/v0.1.0.sql"))]));

#[extend::ext(name = MigrationExt)]
pub impl Connection {
    fn migrate_to_latest(&mut self) -> rusqlite_migration::Result<()> {
        MIGRATIONS.to_latest(self)
    }
}

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    use super::{MigrationExt, MIGRATIONS};

    #[test]
    fn migrations_test() {
        assert!(MIGRATIONS.validate().is_ok());
    }

    pub fn prepare_test_database() -> Result<Connection, Box<dyn std::error::Error>> {
        let mut db = Connection::open_in_memory()?;
        db.migrate_to_latest()?;

        Ok(db)
    }
}
