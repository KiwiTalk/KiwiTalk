use kiwi_talk_db::{chat::model::{ChatModel, LogId}, model::FullModel, channel::model::{ChannelId, ChannelModel}};
use talk_loco_command::structs::{chat::Chatlog, channel_info::ChannelListData};

// TODO:: use trait
pub fn chat_model_from_chatlog(chatlog: &Chatlog) -> FullModel<LogId, ChatModel> {
    FullModel::new(
        chatlog.log_id,
        ChatModel {
            channel_id: chatlog.chat_id,
            prev_log_id: chatlog.prev_log_id,
            chat_type: chatlog.chat_type,
            message_id: chatlog.msg_id,
            send_at: chatlog.send_at,
            author_id: chatlog.author_id,
            message: chatlog.message.clone(),
            attachment: chatlog.attachment.clone(),
            supplement: chatlog.supplement.clone(),
            referer: chatlog.referer,
            deleted: false,
        },
    )
}

// TODO:: use trait
pub fn channel_model_from_channel_list_data(data: &ChannelListData) -> FullModel<ChannelId, ChannelModel> {
    FullModel::new(
        data.id,
        ChannelModel {
            channel_type: data.channel_type.clone(),
            active_user_count: data.active_member_count,
            new_chat_count: data.unread_count,
            last_chat_log_id: data.last_log_id,
            last_seen_log_id: data.last_seen_log_id,
            push_alert: data.push_alert,
        },
    )
}
