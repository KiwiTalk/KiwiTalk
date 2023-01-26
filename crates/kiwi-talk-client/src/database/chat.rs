use rusqlite::{Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};

use crate::{
    channel::ChannelId,
    chat::{Chat, ChatContent, LogId, LoggedChat},
};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ChatModel {
    pub logged: LoggedChat,

    pub deleted_time: Option<i64>,
}

impl ChatModel {
    fn map_row(row: &Row) -> Result<ChatModel, rusqlite::Error> {
        Ok(ChatModel {
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
    fn insert_chat(&self, model: &ChatModel) -> Result<(), rusqlite::Error> {
        self.execute(
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

    fn get_chat_from_log_id(&self, log_id: LogId) -> Result<Option<ChatModel>, rusqlite::Error> {
        self.query_row(
            "SELECT * FROM chat WHERE log_id = ?",
            [log_id],
            ChatModel::map_row,
        )
        .optional()
    }

    fn update_chat_type(&self, log_id: LogId, chat_type: i32) -> Result<usize, rusqlite::Error> {
        self.execute(
            "UPDATE chat SET type = ? WHERE log_id = ?",
            (chat_type, log_id),
        )
    }

    fn update_chat_deleted(&self, log_id: LogId, deleted: bool) -> Result<usize, rusqlite::Error> {
        self.execute(
            "UPDATE chat SET deleted = ? WHERE log_id = ?",
            (deleted, log_id),
        )
    }

    fn delete_chat(&self, log_id: LogId) -> Result<usize, rusqlite::Error> {
        self.execute("DELETE FROM chat WHERE log_id = ?", [log_id])
    }

    fn clear_all_chat(&self) -> Result<usize, rusqlite::Error> {
        self.execute("TRUNCATE TABLE chat", ())
    }

    fn clear_all_chat_in(&self, channel_id: ChannelId) -> Result<usize, rusqlite::Error> {
        self.execute("DELETE FROM chat WHERE channel_id = ?", [channel_id])
    }

    fn get_chats_from_latest(
        &self,
        channel_id: ChannelId,
        offset: u64,
        limit: u64,
    ) -> Result<Vec<ChatModel>, rusqlite::Error> {
        let mut statement = self
            .prepare("SELECT * FROM chat WHERE channel_id = ? ORDER BY log_id DESC LIMIT ?, ?")?;

        let rows = statement.query((channel_id, offset, limit))?;
        rows.mapped(ChatModel::map_row).collect()
    }

    fn get_lastest_chat_log_id(&self, channel_id: ChannelId) -> Result<LogId, rusqlite::Error> {
        self.query_row(
            "SELECT log_id FROM chat WHERE channel_id = ? ORDER BY log_id DESC LIMIT 1",
            [channel_id],
            |row| row.get(0),
        )
    }
}

#[cfg(test)]
mod tests {
    use std::error::Error;

    use rusqlite::Connection;

    use crate::{
        chat::{Chat, LoggedChat},
        database::{
            channel::model::ChannelModel, model::FullModel, tests::prepare_test_database,
            KiwiTalkConnectionExt,
        },
    };

    use super::{ChatDatabaseExt, ChatModel};

    fn add_test_chat(db: &Connection) -> Result<ChatModel, rusqlite::Error> {
        let model = ChatModel {
            logged: LoggedChat {
                log_id: 0,
                prev_log_id: None,
                channel_id: 0,
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

        db.channel().insert(&FullModel::new(
            0,
            ChannelModel {
                channel_type: "OM".into(),
                active_user_count: 0,
                new_chat_count: 0,
                last_chat_log_id: 0,
                last_seen_log_id: 0,
                push_alert: true,

                last_update: 0,
            },
        ))?;

        db.insert_chat(&model)?;

        Ok(model)
    }

    #[test]
    fn chat_insert() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;
        let chat = add_test_chat(&db)?;

        assert_eq!(chat, db.get_chat_from_log_id(0)?.unwrap());

        Ok(())
    }

    #[test]
    fn chat_fetch() -> Result<(), Box<dyn Error>> {
        let db = prepare_test_database()?;
        let chat = add_test_chat(&db)?;

        assert_eq!(chat, db.get_chats_from_latest(0, 0, 1)?.pop().unwrap());

        Ok(())
    }
}
