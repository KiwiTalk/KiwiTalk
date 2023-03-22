use talk_api_client::{agent::TalkApiAgent, auth::xvc::default::Win32XVCHasher};

pub const TALK_AGENT: TalkApiAgent = TalkApiAgent::Win32("10.0");
pub const XVC_HASHER: Win32XVCHasher = Win32XVCHasher("ARTHUR", "RUZ");
