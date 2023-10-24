pub mod model;
pub mod schema;
mod constants;

use diesel::{SqliteConnection, connection::SimpleConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use futures::{Future, FutureExt};
use r2d2::Pool;
use thiserror::Error;

use self::constants::INIT_SQL;

type ConnectionManager = diesel::r2d2::ConnectionManager<SqliteConnection>;

#[derive(Debug, Clone)]
pub struct DatabasePool(Pool<ConnectionManager>);

impl DatabasePool {
    pub async fn initialize(url: impl Into<String>) -> PoolTaskResult<Self> {
        let this = Self(Pool::new(ConnectionManager::new(url))?);
        this.spawn(|conn| {
            conn.batch_execute(INIT_SQL)?;

            Ok(())
        }).await?;

        Ok(this)
    }

    pub fn get(&self) -> Result<PooledConnection, r2d2::Error> {
        self.0.get()
    }

    pub fn spawn<R: Send + 'static, F: FnOnce(&mut PooledConnection) -> PoolTaskResult<R>>(
        &self,
        closure: F,
    ) -> impl Future<Output = PoolTaskResult<R>>
    where
        F: Send + 'static,
    {
        let this = self.clone();

        tokio::task::spawn_blocking(move || closure(&mut this.get()?)).map(|res| res.unwrap())
    }

    pub async fn migrate_to_latest(&self) -> Result<(), MigrationError> {
        const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

        let this = self.clone();

        tokio::task::spawn_blocking(move || {
            this.get()?.run_pending_migrations(MIGRATIONS)?;

            Ok(())
        })
        .map(|res| res.unwrap())
        .await
    }
}

pub type PooledConnection = r2d2::PooledConnection<ConnectionManager>;

#[derive(Debug, Error)]
#[error(transparent)]
pub enum PoolTaskError {
    Database(#[from] diesel::result::Error),

    Pool(#[from] r2d2::Error),
}

#[derive(Debug, Error)]
#[error(transparent)]
pub enum MigrationError {
    Migration(#[from] Box<dyn std::error::Error + Send + Sync>),

    Pool(#[from] r2d2::Error),
}

pub type PoolTaskResult<T> = Result<T, PoolTaskError>;
