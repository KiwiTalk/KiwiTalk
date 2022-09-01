pub mod codec;

use std::borrow::Cow;

#[derive(Debug, Clone)]
pub struct BsonCommand<T> {
    pub method: Cow<'static, str>,
    pub data_type: i8,
    pub data: T,
}

impl<T> BsonCommand<T> {
    pub const fn new(method: Cow<'static, str>, data_type: i8, data: T) -> Self {
        Self {
            method,
            data_type,
            data,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ReadBsonCommand<T> {
    pub id: i32,
    pub command: BsonCommand<T>,
}
