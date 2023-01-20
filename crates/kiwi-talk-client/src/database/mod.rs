pub mod conversion;

use std::path::Path;

use futures::{Future, FutureExt};
use kiwi_talk_db::{rusqlite, rusqlite_migration, KiwiTalkConnection};
use r2d2::{ManageConnection, Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct KiwiTalkDatabasePool(Pool<KiwiTalkDatabaseManager>);

impl KiwiTalkDatabasePool {
    pub fn new(manager: KiwiTalkDatabaseManager) -> Result<Self, PoolError> {
        Ok(Self(Pool::new(manager)?))
    }

    pub fn spawn_task<
        R: Send + 'static,
        F: FnOnce(PooledConnection<KiwiTalkDatabaseManager>) -> Result<R, KiwiTalkDatabaseError>,
    >(
        &self,
        closure: F,
    ) -> impl Future<Output = Result<R, KiwiTalkDatabaseError>>
    where
        F: Send + 'static,
    {
        let pool = self.0.clone();
        tokio::task::spawn_blocking(move || {
            let connection = pool.get().map_err(PoolError)?;

            closure(connection)
        })
        .map(|res| res.unwrap())
    }
}

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
}

impl ManageConnection for KiwiTalkDatabaseManager {
    type Connection = KiwiTalkConnection;

    type Error = KiwiTalkDatabaseError;

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
#[error(transparent)]
pub struct PoolError(#[from] r2d2::Error);

#[derive(Debug, Error)]
pub enum KiwiTalkDatabaseError {
    #[error(transparent)]
    Rusqlite(#[from] rusqlite::Error),

    #[error(transparent)]
    Pool(#[from] PoolError),

    #[error(transparent)]
    Initialization(#[from] rusqlite_migration::Error),
}
