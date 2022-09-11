macro_rules! talk_version {
    () => {
        "3.4.2"
    };
}

macro_rules! talk_app_build {
    () => {
        "3187"
    };
}

pub const TALK_VERSION: &str = talk_version!();
pub const TALK_APP_VERSION: &str = concat!(talk_version!(), ".", talk_app_build!());
pub const TALK_OS: &str = "win32";
pub const TALK_MCCMNC: &str = "999";
pub const TALK_MODEL: &str = "";
pub const TALK_NET_TYPE: i16 = 0;
pub const TALK_DEVIVCE_TYPE: i8 = 2;
pub const TALK_USE_SUB: bool = true;

pub const BOOKING_SERVER: (&str, u16) = ("booking-loco.kakao.com", 443);

pub const CHECKIN_SERVER: (&str, u16) = ("ticket-loco.kakao.com", 443);
