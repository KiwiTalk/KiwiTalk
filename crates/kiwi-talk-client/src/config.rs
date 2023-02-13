use talk_loco_command::structs::client::ClientInfo;

#[derive(Debug, Clone, Copy)]
pub struct KiwiTalkClientInfo<'a> {
    pub os: &'a str,
    pub net_type: i16,
    pub app_version: &'a str,
    pub mccmnc: &'a str,
    pub language: &'a str,
    pub device_type: i8,
}

impl KiwiTalkClientInfo<'_> {
    pub fn create_loco_client_info(&self) -> ClientInfo {
        ClientInfo {
            os: self.os.to_string(),
            net_type: self.net_type,
            app_version: self.app_version.to_string(),
            mccmnc: self.mccmnc.to_string(),
        }
    }
}
