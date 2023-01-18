use std::error::Error;

use kiwi_talk_db::{
    channel::model::{ChannelModel, ChannelUserModel},
    chat::model::ChatModel,
    model::FullModel,
    KiwiTalkConnection,
};
use rusqlite::Connection;

fn prepare_test_database() -> Result<KiwiTalkConnection, Box<dyn Error>> {
    let mut db = KiwiTalkConnection::new(Connection::open_in_memory()?);
    db.migrate_to_latest()?;

    Ok(db)
}

#[test]
fn chat_insert() -> Result<(), Box<dyn Error>> {
    let db = prepare_test_database()?;
    db.channel().insert(&FullModel::new(
        0,
        ChannelModel {
            channel_type: "OM".into(),
            active_user_count: 0,
            new_chat_count: 0,
            last_chat_log_id: Some(0),
            last_seen_log_id: Some(0),
            push_alert: true,
        },
    ))?;

    let model = ChatModel {
        channel_id: 0,
        prev_log_id: Some(0),
        chat_type: 1,
        message_id: 0,
        send_at: 0,
        author_id: 0,
        message: Some("".into()),
        attachment: Some("".into()),
        supplement: None,
        referer: None,
        deleted: false,
    };

    db.chat().insert(&FullModel::new(0, model.clone()))?;
    assert_eq!(model, db.chat().get_chat_from_log_id(0)?.unwrap());

    assert_eq!(model, db.chat().get_chats_from_latest(0, 0, 1)?.pop().unwrap().model);

    Ok(())
}

#[test]
fn channel_user_insert() -> Result<(), Box<dyn Error>> {
    let db = prepare_test_database()?;
    db.channel().insert(&FullModel::new(
        0,
        ChannelModel {
            channel_type: "OM".into(),
            active_user_count: 0,
            new_chat_count: 0,
            last_chat_log_id: Some(0),
            last_seen_log_id: Some(0),
            push_alert: true,
        },
    ))?;

    let model = ChannelUserModel {
        channel_id: 0,
        nickname: "".into(),
        profile_url: None,
        full_profile_url: None,
        original_profile_url: None,
        user_type: 0,
    };

    db.user().insert(&FullModel::new(0, model))?;

    Ok(())
}
