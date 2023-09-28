use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content", rename_all = "camelCase")]
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
