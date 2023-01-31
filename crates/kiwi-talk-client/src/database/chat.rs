use rusqlite::{Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};

use crate::{
    channel::ChannelId,
    chat::{Chat, ChatContent, LogId, LoggedChat},
};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ChatModel {
    pub logged: LoggedChat,

    pub deleted_time: Option<i64>,
}

impl ChatModel {
    pub fn map_row(row: &Row) -> Result<Self, rusqlite::Error> {
        Ok(Self {
            logged: LoggedChat {
                log_id: row.get(0)?,
                prev_log_id: row.get(2)?,

                channel_id: row.get(1)?,

                sender_id: row.get(6)?,

                send_at: row.get(5)?,

                chat: Chat {
                    chat_type: row.get(3)?,
                    content: ChatContent {
                        message: row.get(7)?,
                        attachment: row.get(8)?,
                        supplement: row.get(9)?,
                    },
                    message_id: row.get(4)?,
                },
                referer: row.get(10)?,
            },

            deleted_time: row.get(11)?,
        })
    }
}

#[extend::ext(name = ChatDatabaseExt)]
pub impl Connection {
    fn chat(&self) -> ChatEntry {
        ChatEntry(self)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ChatEntry<'a>(pub &'a Connection);

impl ChatEntry<'_> {
    pub fn insert(&self, model: &ChatModel) -> Result<(), rusqlite::Error> {
        self.0.execute(
            "INSERT OR REPLACE INTO chat VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                model.logged.log_id,
                model.logged.channel_id,
                model.logged.prev_log_id,
                model.logged.chat.chat_type,
                model.logged.chat.message_id,
                model.logged.send_at,
                model.logged.sender_id,
                model.logged.chat.content.message.as_ref(),
                model.logged.chat.content.attachment.as_ref(),
                model.logged.chat.content.supplement.as_ref(),
                model.logged.referer,
                model.deleted_time,
            ),
        )?;

        Ok(())
    }

    pub fn get_from_log_id(&self, log_id: LogId) -> Result<Option<ChatModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM chat WHERE log_id = ?",
                [log_id],
                ChatModel::map_row,
            )
            .optional()
    }

    pub fn update_type(&self, log_id: LogId, chat_type: i32) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE chat SET type = ? WHERE log_id = ?",
            (chat_type, log_id),
        )
    }

    pub fn update_deleted_time(
        &self,
        log_id: LogId,
        deleted_time: Option<i64>,
    ) -> Result<usize, rusqlite::Error> {
        self.0.execute(
            "UPDATE chat SET deleted = ? WHERE log_id = ?",
            (deleted_time, log_id),
        )
    }

    pub fn clear_all(&self) -> Result<usize, rusqlite::Error> {
        self.0.execute("TRUNCATE TABLE chat", ())
    }

    pub fn clear_all_in(&self, channel_id: ChannelId) -> Result<usize, rusqlite::Error> {
        self.0
            .execute("DELETE FROM chat WHERE channel_id = ?", [channel_id])
    }

    pub fn get_from_latest<B: FromIterator<ChatModel>>(
        &self,
        channel_id: ChannelId,
        offset: u64,
        limit: u64,
    ) -> Result<B, rusqlite::Error> {
        let mut statement = self
            .0
            .prepare("SELECT * FROM chat WHERE channel_id = ? ORDER BY log_id DESC LIMIT ?, ?")?;

        let rows = statement.query((channel_id, offset, limit))?;
        rows.mapped(ChatModel::map_row).collect()
    }

    pub fn get_latest_in(
        &self,
        channel_id: ChannelId,
    ) -> Result<Option<ChatModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM chat WHERE channel_id = ? ORDER BY log_id DESC LIMIT 1",
                [channel_id],
                ChatModel::map_row,
            )
            .optional()
    }

    pub fn get_latest_not_deleted_in(
        &self,
        channel_id: ChannelId,
    ) -> Result<Option<ChatModel>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT * FROM chat \
                WHERE channel_id = ? AND deleted_time IS NULL \
                ORDER BY log_id DESC LIMIT 1",
                [channel_id],
                ChatModel::map_row,
            )
            .optional()
    }

    pub fn get_latest_log_id_in(
        &self,
        channel_id: ChannelId,
    ) -> Result<Option<LogId>, rusqlite::Error> {
        self.0
            .query_row(
                "SELECT log_id FROM chat WHERE channel_id = ? ORDER BY log_id DESC LIMIT 1",
                [channel_id],
                |row| row.get(0),
            )
            .optional()
    }
}

#[cfg(test)]
pub(crate) mod tests {
    use std::error::Error;

    use rusqlite::Connection;

    use crate::{
        channel::ChannelId,
        chat::{Chat, LogId, LoggedChat},
        database::tests::prepare_test_database,
    };

    use super::{ChatDatabaseExt, ChatModel};

    pub fn add_test_chat(
        db: &Connection,
        log_id: LogId,
        channel_id: ChannelId,
    ) -> Result<ChatModel, rusqlite::Error> {
        let model = ChatModel {
            logged: LoggedChat {
                log_id,
                prev_log_id: None,
                channel_id,
                sender_id: 0,
                send_at: 0,
                chat: Chat {
                    chat_type: 1,
                    content: Default::default(),
                    message_id: 0,
                },
                referer: None,
            },
            deleted_time: None,
        };

        db.chat().insert(&model)?;

        Ok(model)
    }

    #[test]
    fn chat_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;
        let chat = add_test_chat(&db, 0, 0)?;

        assert_eq!(chat, db.chat().get_from_log_id(0)?.unwrap());

        Ok(())
    }

    #[test]
    fn chat_fetch() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;
        let chat = add_test_chat(&db, 0, 0)?;

        assert_eq!(
            chat,
            db.chat().get_from_latest::<Vec<_>>(0, 0, 1)?.pop().unwrap()
        );

        Ok(())
    }
}
