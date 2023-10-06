#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Credential {
    pub device_uuid: String,
    pub access_token: String,
}