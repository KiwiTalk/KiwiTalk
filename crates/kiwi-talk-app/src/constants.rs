use talk_api_client::{agent::TalkApiAgent, auth::xvc::default::Win32XVCHasher};

pub const DEFAULT_DEVICE_LOCALE: &str = "en-US";
pub const DEFAULT_DEVICE_NAME: &str = "Unknown";

pub const APP_PORTABLE_DATA_DIR: &str = "data";
pub const APP_DEVICE_UUID_FILE: &str = "device_uuid";

pub const TALK_AGENT: TalkApiAgent = TalkApiAgent::Win32("10.0");
pub const XVC_HASHER: Win32XVCHasher = Win32XVCHasher("ARTHUR", "RUZ");
pub const AUTO_LOGIN_KEY: (&str, &str) = ("PITT", "INORAN");

pub const TALK_VERSION: &str = "3.4.7";
pub const TALK_OS: &str = "win32";
pub const TALK_MCCMNC: &str = "999";
pub const TALK_MODEL: &str = "";
pub const TALK_NET_TYPE: i16 = 0;
pub const TALK_DEVICE_TYPE: i8 = 2;
pub const TALK_USE_SUB: bool = true;

pub const BOOKING_SERVER: (&str, u16) = ("booking-loco.kakao.com", 443);

pub const CHECKIN_SERVER: (&str, u16) = ("ticket-loco.kakao.com", 443);
