use serde::{Deserialize, Serialize};

/// Send before server disconnect connection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Kickout {
    /// Kicked reasoon
    ///
    /// * Change server = 2
    /// * Login another = 0
    /// * Account deleted = 1
    pub reason: i16,
}
