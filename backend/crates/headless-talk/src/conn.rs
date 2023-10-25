use futures_loco_protocol::session::LocoSession;

use crate::database::DatabasePool;

#[derive(Debug, Clone)]
pub struct Conn {
    pub user_id: i64,
    pub session: LocoSession,
    pub pool: DatabasePool,
}