use serde::Serialize;
use std::fmt::Write;

pub type TauriResult<T> = Result<T, TauriAnyhowError>;

#[repr(transparent)]
pub struct TauriAnyhowError(anyhow::Error);

impl From<anyhow::Error> for TauriAnyhowError {
    fn from(err: anyhow::Error) -> Self {
        Self(err)
    }
}

impl Serialize for TauriAnyhowError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut error = String::new();
        write!(error, "{:?}", self.0).unwrap();

        serializer.serialize_str(&error)
    }
}
