#[derive(Debug, PartialEq, Eq)]
pub struct ChannelModel {
    pub id: i64,
    pub channel_type: String,
    pub active_user_count: i32,
    pub new_chat_count: i32,
    pub last_chat_log_id: i64,
    pub last_seen_log_id: i64,
    pub push_alert: bool,
}
