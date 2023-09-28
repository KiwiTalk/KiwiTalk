use std::path::Path;

use futures::{Future, FutureExt};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::OpenFlags;
use thiserror::Error;

use super::MigrationExt;

#[derive(Debug, Clone)]
pub struct DatabasePool(Pool<SqliteConnectionManager>);

impl DatabasePool {
    pub fn file(path: impl AsRef<Path>, create: bool) -> Result<Self, PoolError> {
        let mut manager = SqliteConnectionManager::file(path);
        if create {
            manager = manager.with_flags(OpenFlags::default() | OpenFlags::SQLITE_OPEN_CREATE);
        }

        Ok(Self(Pool::new(manager)?))
    }

    pub fn get(&self) -> Result<PooledConnection, PoolError> {
        self.0.get().map_err(PoolError)
    }

    pub fn spawn_task<R: Send + 'static, F: FnOnce(PooledConnection) -> PoolTaskResult<R>>(
        &self,
        closure: F,
    ) -> impl Future<Output = PoolTaskResult<R>>
    where
        F: Send + 'static,
    {
        let this = self.clone();

        tokio::task::spawn_blocking(move || {
            let connection = this.get()?;

            closure(connection)
        })
        .map(|res| res.unwrap())
    }

    pub async fn migrate_to_latest(&self) -> PoolTaskResult<()> {
        self.spawn_task(|mut connection| Ok(connection.migrate_to_latest()?))
            .await
    }
}

pub type PooledConnection = r2d2::PooledConnection<SqliteConnectionManager>;

#[derive(Debug, Error)]
#[error(transparent)]
pub struct PoolError(#[from] r2d2::Error);

#[derive(Debug, Error)]
pub enum PoolTaskError {
    #[error(transparent)]
    Rusqlite(#[from] rusqlite::Error),

    #[error(transparent)]
    Pool(#[from] PoolError),

    #[error(transparent)]
    Initialization(#[from] rusqlite_migration::Error),
}

pub type PoolTaskResult<T> = Result<T, PoolTaskError>;
