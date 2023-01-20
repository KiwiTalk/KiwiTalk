use super::ChatContent;

#[derive(Debug)]
pub struct ChatContentBuilder {
    chat_type: i32,
}

impl ChatContentBuilder {
    pub const fn new(chat_type: i32) -> Self {
        Self { chat_type }
    }

    pub fn build(self) -> ChatContent {
        ChatContent {
            chat_type: self.chat_type,
            message: todo!(),
            attachment: todo!(),
            supplement: todo!(),
        }
    }
}
