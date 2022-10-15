#[derive(Debug, PartialEq, Eq, Clone)]
pub struct ChannelModel {
    pub id: i64,
    pub channel_type: String,
    pub active_user_count: i32,
    pub new_chat_count: i32,
    pub last_chat_log_id: i64,
    pub last_seen_log_id: i64,
    pub push_alert: bool,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct ChannelUserModel {
    pub id: i64,
    pub channel_id: i64,

    pub nickname: String,

    pub profile_url: Option<String>,
    pub full_profile_url: Option<String>,
    pub original_profile_url: Option<String>,
    pub user_type: i32,
}
