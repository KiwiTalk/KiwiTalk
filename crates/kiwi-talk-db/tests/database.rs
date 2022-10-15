use std::error::Error;

use kiwi_talk_db::{chat::model::ChatModel, KiwiTalkConnection, channel::model::{ChannelModel, ChannelUserModel}};
use rusqlite::Connection;

fn prepare_test_database() -> Result<KiwiTalkConnection, Box<dyn Error>> {
    let mut db = KiwiTalkConnection::new(Connection::open_in_memory()?);
    db.migrate_to_latest()?;

    Ok(db)
}

#[test]
fn chat_insert() -> Result<(), Box<dyn Error>> {
    let db = prepare_test_database()?;

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

    db.chat().insert(&model)?;
    assert_eq!(model, db.chat().get_chat_from_log_id(0)?.unwrap());

    Ok(())
}

#[test]
fn user_channel_insert() -> Result<(), Box<dyn Error>> {
    let db = prepare_test_database()?;

    let model = ChannelModel {
        id: 0,
        channel_type: "OM".into(),
        active_user_count: 0,
        new_chat_count: 0,
        last_chat_log_id: Some(0),
        last_seen_log_id: Some(0),
        push_alert: true,
    };
    let user_model = ChannelUserModel {
        id: 0,
        channel_id: 0,
        nickname: "".into(),
        profile_url: None,
        full_profile_url: None,
        original_profile_url: None,
        user_type: 0,
    };

    db.channel().insert(&model)?;
    db.user().insert(&user_model)?;

    Ok(())
}
