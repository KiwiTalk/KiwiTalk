use super::ChatContent;

#[derive(Debug)]
pub struct ChatContentBuilder {}

impl ChatContentBuilder {
    pub const fn new() -> Self {
        Self {}
    }

    pub fn build(self) -> ChatContent {
        todo!()
    }
}
