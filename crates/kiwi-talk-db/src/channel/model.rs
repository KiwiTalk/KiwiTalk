pub type ChannelId = i64;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChannelModel {
    pub channel_type: String,
    pub active_user_count: i32,
    pub new_chat_count: i32,
    pub last_chat_log_id: i64,
    pub last_seen_log_id: i64,
    pub push_alert: bool,
}

pub type ChannelUserId = i64;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChannelUserModel {
    pub channel_id: i64,

    pub nickname: String,

    pub profile_url: Option<String>,
    pub full_profile_url: Option<String>,
    pub original_profile_url: Option<String>,
    pub user_type: i32,

    pub watermark: i64,
}
