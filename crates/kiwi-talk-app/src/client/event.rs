use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content")]
pub enum MainEvent {
    Chat {
        channel: String,
        preview_message: String,
        unread_count: u32,
    },

    Kickout {
        reason: i16,
    },
}
