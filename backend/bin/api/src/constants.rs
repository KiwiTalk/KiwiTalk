use talk_api_internal::{agent::TalkApiAgent, auth::xvc::default::Win32XVCHasher};

pub const TALK_AGENT: TalkApiAgent = TalkApiAgent::Win32("10.0");
pub const XVC_HASHER: Win32XVCHasher = Win32XVCHasher("ARTHUR", "RUZ");
pub const AUTO_LOGIN_KEY: (&str, &str) = ("PITT", "INORAN");

pub const TALK_VERSION: &str = "3.4.7";


