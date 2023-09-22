pub mod request {
    use serde::Serialize;
    use serde_with::skip_serializing_none;

    #[skip_serializing_none]
    #[derive(Debug, Clone, Serialize, PartialEq)]
    pub struct WriteReq<'a> {
        /// Chatroom id
        #[serde(rename = "chatId")]
        pub chat_id: i64,

        /// Chat type
        #[serde(rename = "type")]
        pub chat_type: i32,

        /// Message id
        ///
        /// Client send count??
        #[serde(rename = "msgId")]
        pub msg_id: i64,

        /// Message content
        ///
        /// Usually String, but can be json String according to chat type.
        #[serde(rename = "msg")]
        pub message: Option<&'a str>,

        /// If true, server will assume the client read last message.
        #[serde(rename = "noSeen")]
        pub no_seen: bool,

        /// Attachment content
        ///
        /// Json data. Have contents and extra data according to chat type.
        /// Also known as `extra`.
        #[serde(rename = "extra")]
        pub attachment: Option<&'a str>,

        /// Used on pluschat.
        ///
        /// Cannot be used to send by normal user
        pub supplement: Option<&'a str>,
    }
}

pub mod response {
    use serde::Deserialize;
    use serde_with::skip_serializing_none;

    use crate::structs::chat::Chatlog;

    #[skip_serializing_none]
    #[derive(Debug, Clone, Deserialize, PartialEq)]
    pub struct WriteRes {
        /// Chatroom id
        #[serde(rename = "chatId")]
        pub chat_id: i64,

        /// Previous chat log id
        #[serde(rename = "prevId")]
        pub prev_id: i64,

        /// Sent chat log id
        #[serde(rename = "logId")]
        pub log_id: i64,

        /// Send time in Unix time
        #[serde(rename = "sendAt")]
        pub send_at: i64,

        /// Sent chat message id
        #[serde(rename = "msgId")]
        pub msg_id: i64,

        /// Sent message
        #[serde(rename = "chatLog")]
        pub chatlog: Option<Chatlog>,
    }
}
