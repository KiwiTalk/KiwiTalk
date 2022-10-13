pub mod model;

use rusqlite::{Connection, OptionalExtension, Row};

use self::model::ChatModel;

#[derive(Debug, Clone, Copy)]
pub struct ChatEntry<'a>(pub &'a Connection);

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

    pub fn update_chat_type(&self, log_id: i64, chat_type: i32) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE chat SET type = ? WHERE log_id = ?",
            (chat_type, log_id),
        )
    }

    pub fn delete_chat(&self, log_id: i64) -> Result<usize, rusqlite::Error> {
        self.0
            .execute("DELETE FROM chat WHERE log_id = ?", [log_id])
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
