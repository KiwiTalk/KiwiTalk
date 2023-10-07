pub mod default;

/// Trait for XVC hash calculating
pub trait XvcHasher {
    /// Calculate full XVC hash from given credential information
    fn full_xvc_hash(&self, device_uuid: &str, user_agent: &str, email: &str) -> Vec<u8>;
}
