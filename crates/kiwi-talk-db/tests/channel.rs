use std::error::Error;

use kiwi_talk_db::channel::{model::ChatModel, ChannelConnection};
use rusqlite::Connection;

#[test]
fn test_chat() -> Result<(), Box<dyn Error>> {
    let mut db = ChannelConnection::new(Connection::open_in_memory()?);

    let model = ChatModel {
        log_id: 0,
        prev_log_id: Some(0),
        chat_type: 1,
        message_id: 0,
        send_at: 0,
        author_id: 0,
        message: Some("".into()),
        attachment: Some("".into()),
        supplement: None,
        referer: None,
    };

    db.migrate_to_latest()?;
    db.chat().insert(&model)?;
    assert_eq!(model, db.chat().get_chat_from_log_id(0)?.unwrap());

    Ok(())
}
