#[derive(Debug, Clone, Copy)]
pub struct ClientConfig<'a> {
    pub os: &'a str,
    pub net_type: i16,
    pub app_version: &'a str,
    pub mccmnc: &'a str,
    pub language: &'a str,
    pub device_type: i8,
}
