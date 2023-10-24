use std::pin::pin;

use diesel::RunQueryDsl;
use futures::TryStreamExt;
use futures_loco_protocol::session::LocoSession;
use talk_loco_client::talk::session::TalkSession;

use crate::{
    database::{model::chat::ChatRow, schema::chat, DatabasePool},
    ClientResult,
};

#[derive(Debug)]
pub struct ChatUpdater<'a> {
    session: &'a LocoSession,
    pool: &'a DatabasePool,

    channel_id: i64,
}

impl<'a> ChatUpdater<'a> {
    pub fn new(session: &'a LocoSession, pool: &'a DatabasePool, channel_id: i64) -> Self {
        Self {
            session,
            pool,
            channel_id,
        }
    }

    pub async fn update(self, client_last_log_id: i64, last_log_id: i64) -> ClientResult<()> {
        if client_last_log_id < last_log_id {
            let mut stream = pin!(TalkSession(self.session)
                .channel(self.channel_id)
                .sync_chat_stream(client_last_log_id, last_log_id, 0,));

            let mut chat_row_list = Vec::new();
            while let Some(logs) = stream.try_next().await? {
                for log in logs {
                    chat_row_list.push(ChatRow::from_chatlog(log, None));
                }
            }

            self.pool
                .spawn(move |conn| {
                    diesel::replace_into(chat::table)
                        .values(chat_row_list)
                        .execute(conn)?;

                    Ok(())
                })
                .await?;
        }

        Ok(())
    }
}
