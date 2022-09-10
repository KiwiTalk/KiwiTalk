use rand::Rng;

#[derive(Debug)]
pub struct DeviceInfo {
    pub locale: String,
    pub name: String,
    pub device_uuid: DeviceUuid,
}

impl DeviceInfo {
    #[inline]
    pub fn language(&self) -> &str {
        &self.locale[..2]
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceUuid(String);

impl DeviceUuid {
    pub fn new(data: &[u8; 64]) -> Self {
        DeviceUuid(base64::encode(&data))
    }

    #[inline]
    pub fn as_str(&self) -> &str {
        self.0.as_str()
    }

    pub fn decode(&self) -> Vec<u8> {
        base64::decode(&self.0).unwrap()
    }
}

impl AsRef<str> for DeviceUuid {
    fn as_ref(&self) -> &str {
        self.as_str()
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

pub fn gen_device_uuid() -> DeviceUuid {
    let mut rng = rand::thread_rng();

    let mut random_bytes = [0_u8; 64];
    rng.fill(&mut random_bytes);

    DeviceUuid::new(&random_bytes)
}
