use talk_loco_command::structs::client::ClientInfo;

#[derive(Debug, Clone)]
pub struct KiwiTalkClientConfig {
    pub client: ClientInfo,
    pub language: String,
    pub device_type: i8,
}
