use serde::{Deserialize, Serialize};

/// Signal server to keep connection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ping {}
