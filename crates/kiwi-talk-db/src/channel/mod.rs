pub mod model;

use rusqlite::{Connection, OptionalExtension, Row};

use self::model::ChatModel;

#[derive(Debug)]
pub struct ChannelConnection {
    connection: Connection,
}

impl ChannelConnection {
    pub const fn new(connection: Connection) -> Self {
        Self { connection }
    }

    pub fn initialize(&self) -> Result<(), rusqlite::Error> {
        self.chat().initialize()?;

        Ok(())
    }

    pub const fn user(&self) -> UserEntry<'_> {
        UserEntry {
            connection: &self.connection,
        }
    }

    pub const fn chat(&self) -> ChatEntry<'_> {
        ChatEntry {
            connection: &self.connection,
        }
    }

    pub fn into_inner(self) -> Connection {
        self.connection
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChatEntry<'a> {
    connection: &'a Connection,
}

impl<'a> ChatEntry<'a> {
    pub fn initialize(&self) -> Result<(), rusqlite::Error> {
        self.connection.execute(
            "CREATE TABLE chat (
            log_id INTEGER PRIMARY KEY,
            prev_log_id INTEGER,
            type INTEGER NOT NULL,
            message_id INTEGER NOT NULL,
            send_at INTEGER NOT NULL,
            author_id INTEGER NOT NULL,
            message TEXT,
            attachment TEXT,
            supplement TEXT,
            referer INTEGER
        )",
            (),
        )?;

        Ok(())
    }

    pub fn insert(&self, chat: &ChatModel) -> Result<(), rusqlite::Error> {
        self.connection.execute("INSERT INTO chat (
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
        self.connection
            .query_row(
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
pub struct UserEntry<'a> {
    connection: &'a Connection,
}

impl<'a> UserEntry<'a> {}
