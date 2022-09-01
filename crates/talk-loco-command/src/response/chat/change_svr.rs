use serde::{Deserialize, Serialize};

/// If received, Client must change server or client will get disconencted soon.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChangeSvr;
