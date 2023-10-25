use crate::conn::Conn;

#[derive(Debug)]
pub struct OpenChannel {
    id: i64,
    link_id: i64,
    pub(super) conn: Conn,
}

impl OpenChannel {
    pub const fn id(&self) -> i64 {
        self.id
    }

    pub const fn link_id(&self) -> i64 {
        self.link_id
    }
}
