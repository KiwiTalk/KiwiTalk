use talk_api_client::{agent::TalkApiAgent, auth::xvc::default::Win32XVCHasher};

pub const TALK_AGENT: TalkApiAgent = TalkApiAgent::Win32("10.0");
pub const XVC_HASHER: Win32XVCHasher = Win32XVCHasher("ARTHUR", "RUZ");
pub const AUTO_LOGIN_KEY: (&str, &str) = ("PITT", "INORAN");

pub const TALK_VERSION: &str = "3.4.7";
pub const TALK_OS: &str = "win32";
pub const TALK_MCCMNC: &str = "999";
pub const TALK_NET_TYPE: i16 = 0;
pub const TALK_DEVICE_TYPE: i8 = 2;
pub const TALK_USE_SUB: bool = true;

pub const CHECKIN_SERVER: (&str, u16) = ("ticket-loco.kakao.com", 443);
