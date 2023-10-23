use headless_talk::config::NetworkType;

pub const TALK_OS: &str = "win32";
pub const TALK_MCCMNC: &str = "999";
pub const TALK_NET_TYPE: NetworkType = NetworkType::Wired;
pub const TALK_APP_VERSION: &str = "3.4.7";
pub const TALK_USE_SUB: bool = true;

pub const CHECKIN_SERVER: (&str, u16) = ("ticket-loco.kakao.com", 443);
