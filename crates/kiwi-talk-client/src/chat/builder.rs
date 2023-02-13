use super::ChatContent;

#[derive(Debug)]
pub struct ChatContentBuilder {}

impl ChatContentBuilder {
    pub const fn new() -> Self {
        Self {}
    }

    pub fn build(self) -> ChatContent {
        ChatContent {
            message: todo!(),
            attachment: todo!(),
            supplement: todo!(),
        }
    }
}
