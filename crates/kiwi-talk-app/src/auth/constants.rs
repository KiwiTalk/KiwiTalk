use talk_api_client::{
    agent::TalkApiAgent,
    auth::{xvc::default::Win32XVCHasher, AuthClientConfig, AuthDeviceConfig},
};

use crate::app::constants::TALK_VERSION;

// TODO:: Generate DEVICE_UUID using machine id
pub const DEVICE_UUID: &str =
    "S2l3aVRhbGtLaXdpVGFsa0tpd2lUYWxrS2l3aVRhbGtLaXdpVGFsa0tpd2lUYWxrS2l3aVRhbGtLaXdpVGFsaw==";

pub const DEFAULT_DEVICE_NAME: &str = "Unknown Device";

// TODO:: Remove
pub const CONFIG: AuthClientConfig = AuthClientConfig {
    device: AuthDeviceConfig {
        name: DEFAULT_DEVICE_NAME,
        model: None,
        uuid: DEVICE_UUID,
    },
    language: "ko",
    version: TALK_VERSION,
    agent: TALK_AGENT,
};

pub const TALK_AGENT: TalkApiAgent = TalkApiAgent::Win32("11.0");
pub const XVC_HASHER: Win32XVCHasher = Win32XVCHasher("WINTER", "ARTHUR");
