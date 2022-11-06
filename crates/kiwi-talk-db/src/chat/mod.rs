pub mod model;

use rusqlite::{Connection, OptionalExtension, Row};

use crate::model::FullModel;

use self::model::{ChatModel, LogId};

#[derive(Debug, Clone, Copy)]
pub struct ChatEntry<'a>(pub &'a Connection);

impl<'a> ChatEntry<'a> {
    pub fn insert(&self, chat: &FullModel<LogId, ChatModel>) -> Result<(), rusqlite::Error> {
        self.0.execute("INSERT INTO chat (
            log_id, channel_id, prev_log_id, type, message_id, send_at, author_id, message, attachment, supplement, referer, deleted
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12
        )", (
            &chat.id,
            &chat.model.channel_id,
            &chat.model.prev_log_id,
            &chat.model.chat_type,
            &chat.model.message_id,
            &chat.model.send_at,
            &chat.model.author_id,
            &chat.model.message,
            &chat.model.attachment,
            &chat.model.supplement,
            &chat.model.referer,
            &chat.model.deleted,
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

    pub fn update_deleted(&self, log_id: i64, deleted: bool) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE chat SET deleted = ? WHERE log_id = ?",
            (deleted, log_id),
        )
    }

    pub fn delete_chat(&self, log_id: i64) -> Result<usize, rusqlite::Error> {
        self.0
            .execute("DELETE FROM chat WHERE log_id = ?", [log_id])
    }

    pub fn map_row(row: &Row) -> Result<ChatModel, rusqlite::Error> {
        Ok(ChatModel {
            channel_id: row.get("channel_id")?,
            prev_log_id: row.get("prev_log_id")?,
            chat_type: row.get("type")?,
            message_id: row.get("message_id")?,
            send_at: row.get("send_at")?,
            author_id: row.get("author_id")?,
            message: row.get("message")?,
            attachment: row.get("attachment")?,
            supplement: row.get("supplement")?,
            referer: row.get("referer")?,
            deleted: row.get("deleted")?,
        })
    }

    pub fn map_full_row(row: &Row) -> Result<FullModel<LogId, ChatModel>, rusqlite::Error> {
        Ok(FullModel {
            id: row.get("log_id")?,
            model: Self::map_row(row)?,
        })
    }
}
