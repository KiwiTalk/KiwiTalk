use serde::Serialize;

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
        serializer.serialize_str(&self.0.to_string())
    }
}
