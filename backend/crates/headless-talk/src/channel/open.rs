use diesel::{ExpressionMethods, RunQueryDsl};
use talk_loco_client::talk::session::TalkSession;

use crate::{
    conn::Conn, database::schema::channel_list, updater::channel::ChannelUpdater, ClientResult,
};

#[derive(Debug, Clone)]
pub struct OpenChannel {}

#[derive(Debug, Clone, Copy)]
pub struct OpenChannelOp<'a> {
    id: i64,
    link_id: i64,
    conn: &'a Conn,
}

impl<'a> OpenChannelOp<'a> {
    pub const fn new(id: i64, link_id: i64, conn: &'a Conn) -> Self {
        Self { id, link_id, conn }
    }

    pub const fn id(self) -> i64 {
        self.id
    }

    pub const fn link_id(self) -> i64 {
        self.link_id
    }

    pub async fn read_chat(self, watermark: i64) -> ClientResult<()> {
        let id = self.id;

        TalkSession(&self.conn.session)
            .open_channel(id, self.link_id)
            .noti_read(watermark)
            .await?;

        self.conn
            .pool
            .spawn(move |conn| {
                diesel::update(channel_list::table)
                    .filter(channel_list::id.eq(id))
                    .set(channel_list::last_seen_log_id.eq(watermark))
                    .execute(conn)?;

                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn leave(self, block: bool) -> ClientResult<()> {
        let id = self.id;

        TalkSession(&self.conn.session)
            .open_channel(id, self.link_id)
            .leave(block)
            .await?;

        self.conn
            .pool
            .spawn_transaction(move |conn| ChannelUpdater::new(id).remove(conn))
            .await?;

        Ok(())
    }
}
