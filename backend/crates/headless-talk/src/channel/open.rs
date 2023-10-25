use crate::HeadlessTalk;

#[derive(Debug, Clone, Copy)]
pub struct OpenChannel<'a> {
    id: i64,
    link_id: i64,
    client: &'a HeadlessTalk,
}

impl<'a> OpenChannel<'a> {
    pub const fn id(self) -> i64 {
        self.id
    }

    pub const fn link_id(self) -> i64 {
        self.link_id
    }

    pub const fn client(self) -> &'a HeadlessTalk {
        self.client
    }
}
