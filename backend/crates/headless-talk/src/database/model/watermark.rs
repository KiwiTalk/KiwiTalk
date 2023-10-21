use diesel::Insertable;

use super::super::schema::watermark;

#[derive(Debug, Insertable, Clone, PartialEq, Eq)]
#[diesel(table_name = watermark)]
pub struct WatermarkRow {
    pub channel_id: i64,

    pub user_id: i64,

    pub log_id: i64,
}
