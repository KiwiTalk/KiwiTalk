use talk_loco_client::talk::{chat::Chatlog, channel::ChannelMeta};

#[derive(Debug, Clone)]
pub enum ChannelEvent {
    Chat {
        link_id: Option<i64>,

        user_nickname: Option<String>,
        chat: Chatlog,
    },

    ChatRead {
        /// Read user id
        user_id: i64,

        /// Read chat log id
        log_id: i64,
    },

    ChangeMeta(ChannelMeta),

    ChatDeleted(Chatlog),
    
    Added {
        chatlog: Option<Chatlog>,
        
    },
}
