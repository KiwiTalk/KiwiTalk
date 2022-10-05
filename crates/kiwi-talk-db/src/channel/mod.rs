pub mod model;

use once_cell::sync::Lazy;
use rusqlite::{Connection, OptionalExtension, Row};
use rusqlite_migration::{Migrations, M};

use self::model::ChatModel;

static MIGRATIONS: Lazy<Migrations<'static>> = Lazy::new(|| {
    Migrations::new(vec![M::up(include_str!(
        "./migrations/202210050951_channel.sql"
    ))])
});

#[derive(Debug)]
pub struct ChannelConnection {
    connection: Connection,
}

impl ChannelConnection {
    pub fn new(connection: Connection) -> Self {
        Self { connection }
    }

    pub fn migrate_to_latest(&mut self) -> rusqlite_migration::Result<()> {
        MIGRATIONS.to_latest(&mut self.connection)
    }

    pub const fn user(&self) -> UserEntry<'_> {
        UserEntry(&self.connection)
    }

    pub const fn chat(&self) -> ChatEntry<'_> {
        ChatEntry(&self.connection)
    }

    pub fn into_inner(self) -> Connection {
        self.connection
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChatEntry<'a>(&'a Connection);

impl<'a> ChatEntry<'a> {
    pub fn insert(&self, chat: &ChatModel) -> Result<(), rusqlite::Error> {
        self.0.execute("INSERT INTO chat (
            log_id, prev_log_id, type, message_id, send_at, author_id, message, attachment, supplement, referer
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10
        )", (
            &chat.log_id,
            &chat.prev_log_id,
            &chat.chat_type,
            &chat.message_id,
            &chat.send_at,
            &chat.author_id,
            &chat.message,
            &chat.attachment,
            &chat.supplement,
            &chat.referer
        ))?;

        Ok(())
    }

    pub fn get_chat_from_log_id(&self, log_id: i64) -> Result<Option<ChatModel>, rusqlite::Error> {
        self.0
            .query_row_and_then(
                "SELECT * FROM chat WHERE log_id = ?",
                [log_id],
                Self::map_row,
            )
            .optional()
    }

    fn map_row(row: &Row) -> Result<ChatModel, rusqlite::Error> {
        Ok(ChatModel {
            log_id: row.get("log_id")?,
            prev_log_id: row.get("prev_log_id")?,
            chat_type: row.get("type")?,
            message_id: row.get("message_id")?,
            send_at: row.get("send_at")?,
            author_id: row.get("author_id")?,
            message: row.get("message")?,
            attachment: row.get("attachment")?,
            supplement: row.get("supplement")?,
            referer: row.get("referer")?,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub struct UserEntry<'a>(&'a Connection);

impl<'a> UserEntry<'a> {}

#[cfg(test)]
mod tests {
    use super::MIGRATIONS;

    #[test]
    fn migrations_test() {
        assert!(MIGRATIONS.validate().is_ok());
    }
}
