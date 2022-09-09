use rand::Rng;

#[derive(Debug)]
pub struct DeviceInfo {
    pub locale: String,
    pub name: String,
    pub device_uuid: String,
}

impl DeviceInfo {
    #[inline]
    pub fn language(&self) -> &str {
        &self.locale[..2]
    }
}

pub fn get_device_locale() -> Option<String> {
    sys_locale::get_locale()
}

pub fn get_device_name() -> Option<String> {
    hostname::get()
        .map(|hostname| hostname.into_string().ok())
        .ok()
        .flatten()
}

pub fn gen_device_uuid() -> String {
    let mut rng = rand::thread_rng();

    let mut random_bytes = [0_u8; 64];
    rng.fill(&mut random_bytes);

    base64::encode(random_bytes)
}
