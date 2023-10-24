use talk_loco_client::talk::session::TalkSession;

use crate::{HeadlessTalk, ClientResult};

#[derive(Debug, Clone, Copy)]
pub struct OpenChannel<'a> {
    id: i64,
    link_id: i64,
    client: &'a HeadlessTalk,
}

impl OpenChannel<'_> {
    pub const fn id(&self) -> i64 {
        self.id
    }

    pub const fn client(&self) -> &'_ HeadlessTalk {
        self.client
    }

    pub async fn read_chat(&self, watermark: i64) -> ClientResult<()> {
        TalkSession(&self.client.session)
            .open_channel(self.id, self.link_id)
            .noti_read(watermark)
            .await?;

        Ok(())
    }
}
