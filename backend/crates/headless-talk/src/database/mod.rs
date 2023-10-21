pub mod model;
pub mod schema;

use diesel::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use futures::{Future, FutureExt};
use r2d2::Pool;
use thiserror::Error;

type ConnectionManager = diesel::r2d2::ConnectionManager<SqliteConnection>;

#[derive(Debug, Clone)]
pub struct DatabasePool(Pool<ConnectionManager>);

impl DatabasePool {
    pub fn file(url: impl Into<String>) -> Result<Self, PoolError> {
        Ok(Self(Pool::new(ConnectionManager::new(url))?))
    }

    pub fn get(&self) -> Result<PooledConnection, PoolError> {
        self.0.get().map_err(PoolError)
    }

    pub fn spawn<R: Send + 'static, F: FnOnce(PooledConnection) -> PoolTaskResult<R>>(
        &self,
        closure: F,
    ) -> impl Future<Output = PoolTaskResult<R>>
    where
        F: Send + 'static,
    {
        let this = self.clone();

        tokio::task::spawn_blocking(move || closure(this.get()?)).map(|res| res.unwrap())
    }

    pub async fn migrate_to_latest(&self) -> PoolTaskResult<()> {
        const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

        self.spawn(|mut connection| {
            connection.run_pending_migrations(MIGRATIONS)?;

            Ok(())
        })
        .await
    }
}

pub type PooledConnection = r2d2::PooledConnection<ConnectionManager>;

#[derive(Debug, Error)]
#[error(transparent)]
pub struct PoolError(#[from] r2d2::Error);

#[derive(Debug, Error)]
#[error(transparent)]
pub enum PoolTaskError {
    Database(#[from] Box<dyn std::error::Error + Send + Sync>),

    Pool(#[from] PoolError),
}

pub type PoolTaskResult<T> = Result<T, PoolTaskError>;
