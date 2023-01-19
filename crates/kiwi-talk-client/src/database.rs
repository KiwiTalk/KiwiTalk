use std::path::Path;

use kiwi_talk_db::{rusqlite, rusqlite_migration, KiwiTalkConnection};
use r2d2::{ManageConnection, Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use thiserror::Error;

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

    type Error = ConnectionManagerError;

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

#[derive(Debug, Error)]
pub enum ConnectionManagerError {
    #[error(transparent)]
    Rusqlite(#[from] rusqlite::Error),

    #[error(transparent)]
    Pool(#[from] r2d2::Error),

    #[error(transparent)]
    Initialization(#[from] rusqlite_migration::Error),
}

pub async fn run_database_task<
    F: FnOnce(PooledConnection<KiwiTalkDatabaseManager>) -> Result<(), ConnectionManagerError>,
>(
    pool: KiwiTalkDatabasePool,
    closure: F,
) -> Result<(), ConnectionManagerError>
where
    F: Send + 'static,
{
    tokio::task::spawn_blocking(move || {
        let connection = pool.get()?;

        closure(connection)
    })
    .await
    .unwrap()
}
