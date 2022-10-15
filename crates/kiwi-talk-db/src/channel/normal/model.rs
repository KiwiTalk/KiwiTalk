#[derive(Debug, PartialEq, Eq, Clone)]
pub struct NormalChannelModel {
    pub id: i64,
    pub join_time: i64,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct NormalUserModel {
    pub id: i64,
    pub channel_id: i64,

    pub country_iso: String,
    pub account_id: i64,
    pub status_message: Option<String>,
    pub linked_services: Option<String>,
    pub user_type: i32,
    pub suspended: bool,
}
