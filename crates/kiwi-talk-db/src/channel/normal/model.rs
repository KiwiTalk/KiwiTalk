#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NormalChannelModel {
    pub join_time: i64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NormalUserModel {
    pub channel_id: i64,

    pub country_iso: String,
    pub account_id: i64,
    pub status_message: Option<String>,
    pub linked_services: Option<String>,
    pub suspended: bool,
}
