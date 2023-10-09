#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Credential<'a> {
    pub device_uuid: &'a str,
    pub access_token: &'a str,
}
