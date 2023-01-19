use kiwi_talk_db::{KiwiTalkConnection, rusqlite};
use r2d2::ManageConnection;
use r2d2_sqlite::SqliteConnectionManager;

pub struct KiwiTalkDatabaseManager {
    rusqlite: SqliteConnectionManager
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