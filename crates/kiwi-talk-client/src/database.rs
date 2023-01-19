use std::path::Path;

use kiwi_talk_db::{rusqlite, KiwiTalkConnection};
use r2d2::{ManageConnection, Pool};
use r2d2_sqlite::SqliteConnectionManager;

pub type KiwiTalkDatabasePool = Pool<KiwiTalkDatabaseManager>;

#[derive(Debug)]
pub struct KiwiTalkDatabaseManager {
    rusqlite: SqliteConnectionManager,
}

impl KiwiTalkDatabaseManager {
    #[inline(always)]
    pub fn file(path: impl AsRef<Path>) -> Self {
        Self {
            rusqlite: SqliteConnectionManager::file(path),
        }
    }

    #[inline(always)]
    pub fn memory() -> Self {
        Self {
            rusqlite: SqliteConnectionManager::memory(),
        }
    }
}

impl ManageConnection for KiwiTalkDatabaseManager {
    type Connection = KiwiTalkConnection;

    type Error = rusqlite::Error;

    fn connect(&self) -> Result<Self::Connection, Self::Error> {
        Ok(KiwiTalkConnection::new(self.rusqlite.connect()?))
    }

    fn is_valid(&self, conn: &mut Self::Connection) -> Result<(), Self::Error> {
        conn.inner().execute_batch("").map_err(Into::into)
    }

    fn has_broken(&self, _: &mut Self::Connection) -> bool {
        false
    }
}
