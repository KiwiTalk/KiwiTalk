#[derive(Debug, PartialEq, Eq)]
pub struct ChatModel {
    pub log_id: i64,
    pub prev_log_id: Option<i64>,

    pub chat_type: i32,

    pub message_id: i64,

    pub send_at: i32,

    pub author_id: i64,

    pub message: Option<String>,
    pub attachment: Option<String>,

    pub supplement: Option<String>,

    pub referer: Option<i32>,
}

#[derive(Debug, PartialEq, Eq)]
pub struct UserModel {
    
}