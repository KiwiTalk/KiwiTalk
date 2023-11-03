use tokio::task::AbortHandle;

#[derive(Debug)]
pub struct BackgroundTask(AbortHandle);

impl BackgroundTask {
    pub const fn new(handle: AbortHandle) -> Self {
        Self(handle)
    }
}

impl Drop for BackgroundTask {
    fn drop(&mut self) {
        self.0.abort();
    }
}
