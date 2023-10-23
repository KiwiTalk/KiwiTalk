use diesel::Insertable;
use talk_loco_client::talk::chat::Chatlog;

use super::super::schema::chat;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = chat)]
pub struct ChatRow<'a> {
    pub log_id: i64,

    pub channel_id: i64,

    pub prev_log_id: Option<i64>,

    #[diesel(column_name = "type_")]
    pub chat_type: i32,

    pub message_id: i64,

    pub send_at: i64,

    pub author_id: i64,

    pub message: Option<&'a str>,

    pub attachment: Option<&'a str>,

    pub supplement: Option<&'a str>,

    pub referer: Option<i32>,

    pub deleted_time: Option<i64>,
}

impl<'a> ChatRow<'a> {
    pub fn from_chatlog(log: &'a Chatlog, deleted_time: Option<i64>) -> Self {
        Self {
            log_id: log.log_id,
            channel_id: log.channel_id,
            prev_log_id: log.prev_log_id,
            chat_type: log.chat.chat_type.0,
            message_id: log.chat.message_id,
            send_at: log.send_at,
            author_id: log.author_id,
            message: log.chat.content.message.as_deref(),
            attachment: log.chat.content.attachment.as_deref(),
            supplement: log.chat.content.supplement.as_deref(),
            referer: log.referer,
            deleted_time,
        }
    }
}
