use std::{
    path::Path,
    sync::atomic::{AtomicBool, Ordering},
};

use kiwi_talk_db::{rusqlite, KiwiTalkConnection, rusqlite_migration};
use r2d2::{ManageConnection, Pool};
use r2d2_sqlite::SqliteConnectionManager;
use thiserror::Error;

pub type KiwiTalkDatabasePool = Pool<KiwiTalkDatabaseManager>;

#[derive(Debug)]
pub struct KiwiTalkDatabaseManager {
    rusqlite: SqliteConnectionManager,
    initialized: AtomicBool,
}

impl KiwiTalkDatabaseManager {
    #[inline(always)]
    pub fn file(path: impl AsRef<Path>) -> Self {
        Self {
            rusqlite: SqliteConnectionManager::file(path),
            initialized: AtomicBool::new(false),
        }
    }

    #[inline(always)]
    pub fn memory() -> Self {
        Self {
            rusqlite: SqliteConnectionManager::memory(),
            initialized: AtomicBool::new(false),
        }
    }
}

impl ManageConnection for KiwiTalkDatabaseManager {
    type Connection = KiwiTalkConnection;

    type Error = ConnectionManagerError;

    fn connect(&self) -> Result<Self::Connection, Self::Error> {
        let mut connection = KiwiTalkConnection::new(self.rusqlite.connect()?);

        if self
            .initialized
            .compare_exchange(false, true, Ordering::SeqCst, Ordering::Acquire)
            .is_ok()
        {
            connection.migrate_to_latest()?;
        }

        Ok(connection)
    }

    fn is_valid(&self, conn: &mut Self::Connection) -> Result<(), Self::Error> {
        conn.inner().execute_batch("").map_err(Into::into)
    }

    fn has_broken(&self, _: &mut Self::Connection) -> bool {
        false
    }
}

#[derive(Debug, Error)]
pub enum ConnectionManagerError {
    #[error(transparent)]
    Rusqlite(#[from] rusqlite::Error),

    #[error(transparent)]
    Initialization(#[from] rusqlite_migration::Error),
}
