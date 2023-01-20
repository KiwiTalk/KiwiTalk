use kiwi_talk_db::{chat::model::{ChatModel, LogId}, model::FullModel};
use talk_loco_command::structs::chat::Chatlog;

pub fn chat_model_from_chatlog(chatlog: Chatlog) -> FullModel<LogId, ChatModel> {
    FullModel::new(
        chatlog.log_id,
        ChatModel {
            channel_id: chatlog.chat_id,
            prev_log_id: chatlog.prev_log_id,
            chat_type: chatlog.chat_type,
            message_id: chatlog.msg_id,
            send_at: chatlog.send_at,
            author_id: chatlog.author_id,
            message: chatlog.message,
            attachment: chatlog.attachment,
            supplement: chatlog.supplement,
            referer: chatlog.referer,
            deleted: false,
        },
    )
}
