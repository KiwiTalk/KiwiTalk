pub mod request {
    use serde::Serialize;
    use serde_with::skip_serializing_none;

    use crate::talk::LChatListReq;

    /// Login to loco server
    #[skip_serializing_none]
    #[derive(Debug, Clone, Serialize, PartialEq)]
    pub struct LoginListReq<'a> {
        /// Current OS (win32, android, mac, etc.)
        pub os: &'a str,

        /// Network type (0 for wired)
        #[serde(rename = "ntype")]
        pub net_type: i16,

        /// Official app version
        #[serde(rename = "appVer")]
        pub app_version: &'a str,

        /// Network MCCMNC ("999" on pc)
        #[serde(rename = "MCCMNC")]
        pub mccmnc: &'a str,

        /// Protocol version. "1" on mobile and "1.0" on PC.
        #[serde(rename = "prtVer")]
        pub protocol_version: &'a str,

        /// Device uuid String. Usually hashed unique id.
        #[serde(rename = "duuid")]
        pub device_uuid: &'a str,

        /// OAuth access token
        #[serde(rename = "oauthToken")]
        pub oauth_token: &'a str,

        #[serde(rename = "lang")]
        pub language: &'a str,

        /// Device type (PC Only(?)) (2 for pc)
        #[serde(rename = "dtype")]
        pub device_type: Option<i8>,

        /// Unknown (Mobile only)
        pub revision: Option<i32>,

        /// 6 bytes binary (0x?? 0x?? 0xff 0xff 0x?? 0x??)
        #[serde(with = "serde_byte_array")]
        pub rp: [u8; 6],

        /// PC status (PC only) (Same with SETST status?)
        #[serde(rename = "pcst")]
        pub pc_status: Option<i32>,

        #[serde(flatten)]
        pub chat_list: LChatListReq<'a>,

        /// Unknown
        #[serde(rename = "lbk")]
        pub last_block_token: i32,

        /// background checking(?) (Mobile only)
        #[serde(rename = "bg")]
        pub background: Option<bool>,
    }
}

pub mod response {
    use serde::Deserialize;
    use serde_with::skip_serializing_none;

    use crate::talk::LChatListRes;

    /// Contains userId, tokens, chatroom list.
    /// The purposes of tokens, revisions are unknown yet.
    #[skip_serializing_none]
    #[derive(Debug, Clone, Deserialize, PartialEq)]
    pub struct LoginListRes {
        /// Logon user id
        #[serde(rename = "userId")]
        pub user_id: i64,

        #[serde(flatten)]
        pub chat_list: LChatListRes,

        /// Oldest chat id (?)
        #[serde(rename = "minLogId")]
        pub min_log_id: Option<i64>,

        /// Unknown (Mobile only)
        pub revision: Option<i32>,

        /// Revision(?) Info (Json) (Mobile only)
        #[serde(rename = "revisionInfo")]
        pub revision_info: Option<String>,

        /// Unknown
        pub sb: i32,

        /// 6 bytes binary
        #[serde(with = "serde_byte_array")]
        pub rp: [u8; 6],

        /// Unknown
        #[serde(rename = "pkUpdate")]
        pub pk_update: Option<bool>,

        /// Unknown
        #[serde(rename = "pkToken")]
        pub pk_token: Option<i64>,
    }
}
