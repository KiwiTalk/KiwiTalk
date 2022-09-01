use sha2::{Digest, Sha512};

use super::XVCHasher;

/// Default xvc hasher uses win32 platform client format.
///
/// Format: sha512("{first_seed}|{user_agent}|{second_seed}|{email}|{device_uuid}")
#[derive(Debug, Clone)]
pub struct Win32XVCHasher<'a>(pub &'a str, pub &'a str);

impl XVCHasher for Win32XVCHasher<'_> {
    fn full_xvc_hash(&self, device_uuid: &str, user_agent: &str, email: &str) -> Vec<u8> {
        let mut hasher = Sha512::new();

        hasher.update(self.0);
        hasher.update(&"|");
        hasher.update(user_agent);
        hasher.update(&"|");
        hasher.update(self.1);
        hasher.update(&"|");
        hasher.update(email);
        hasher.update(&"|");
        hasher.update(device_uuid);

        hasher.finalize().to_vec()
    }
}

/// Default xvc hasher uses android subdevice platform client format.
///
/// Format: sha512("{first_seed}|{user_agent}|{second_seed}|{email}|{third_seed}")
#[derive(Debug, Clone)]
pub struct AndroidSubXVCHasher<'a>(pub &'a str, pub &'a str, pub &'a str);

impl XVCHasher for AndroidSubXVCHasher<'_> {
    fn full_xvc_hash(&self, _: &str, user_agent: &str, email: &str) -> Vec<u8> {
        let mut hasher = Sha512::new();

        hasher.update(self.0);
        hasher.update(&"|");
        hasher.update(user_agent);
        hasher.update(&"|");
        hasher.update(self.1);
        hasher.update(&"|");
        hasher.update(email);
        hasher.update(&"|");
        hasher.update(self.2);

        hasher.finalize().to_vec()
    }
}
