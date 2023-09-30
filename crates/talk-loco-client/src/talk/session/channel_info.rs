pub mod request {
    use serde::Serialize;

    #[derive(Debug, Clone, Serialize, PartialEq)]
    pub struct ChannelInfoReq {
        /// Chatroom id
        #[serde(rename = "chatId")]
        pub chat_id: i64,
    }
}

pub mod response {
    use serde::Deserialize;

    use crate::structs::channel::ChannelInfo;

    #[derive(Debug, Clone, Deserialize, PartialEq)]
    pub struct ChannelInfoRes {
        /// Channel info
        #[serde(rename = "chatInfo")]
        pub chat_info: ChannelInfo,

        /// Unknown. Only appears on openchat rooms.
        pub o: Option<i32>,
    }
}
