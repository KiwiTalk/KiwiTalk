use std::path::Path;

use futures::{Future, FutureExt};
use r2d2::{ManageConnection, Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use thiserror::Error;

use super::KiwiTalkConnection;

#[derive(Debug, Clone)]
pub struct DatabasePool(Pool<DatabaseManager>);

impl DatabasePool {
    pub fn new(manager: DatabaseManager) -> Result<Self, PoolError> {
        Ok(Self(Pool::new(manager)?))
    }

    pub fn spawn_task<
        R: Send + 'static,
        F: FnOnce(PooledConnection<DatabaseManager>) -> DatabaseResult<R>,
    >(
        &self,
        closure: F,
    ) -> impl Future<Output = DatabaseResult<R>>
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

    pub async fn migrate_to_latest(&self) -> DatabaseResult<()> {
        self.spawn_task(|mut connection| Ok(connection.migrate_to_latest()?))
            .await
    }
}

pub type DatabaseResult<T> = Result<T, DatabasePoolError>;

#[derive(Debug)]
pub struct DatabaseManager {
    rusqlite: SqliteConnectionManager,
}

impl DatabaseManager {
    #[inline(always)]
    pub fn file(path: impl AsRef<Path>) -> Self {
        Self {
            rusqlite: SqliteConnectionManager::file(path),
        }
    }
}

impl ManageConnection for DatabaseManager {
    type Connection = KiwiTalkConnection;

    type Error = DatabasePoolError;

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
pub enum DatabasePoolError {
    #[error(transparent)]
    Rusqlite(#[from] rusqlite::Error),

    #[error(transparent)]
    Pool(#[from] PoolError),

    #[error(transparent)]
    Initialization(#[from] rusqlite_migration::Error),
}
