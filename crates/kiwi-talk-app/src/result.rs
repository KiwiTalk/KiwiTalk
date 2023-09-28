use serde::Serialize;
use std::{fmt::Write, ops::Deref};

pub type TauriResult<T> = Result<T, TauriAnyhowError>;

#[derive(Debug)]
#[repr(transparent)]
pub struct TauriAnyhowError(anyhow::Error);

impl<T: Into<anyhow::Error>> From<T> for TauriAnyhowError {
    fn from(err: T) -> Self {
        Self(err.into())
    }
}

impl Deref for TauriAnyhowError {
    type Target = anyhow::Error;

    fn deref(&self) -> &Self::Target {
        &self.0
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
