use kiwi_talk_db::{
    channel::model::{ChannelId, ChannelModel, ChannelUserId, ChannelUserModel},
    chat::model::{ChatModel, LogId},
    model::FullModel,
};
use talk_loco_command::structs::{channel_info::ChannelListData, chat::Chatlog, user::UserVariant};

use crate::channel::ChannelData;

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
pub fn channel_model_from_channel_data(
    data: &ChannelListData,
) -> FullModel<ChannelId, ChannelModel> {
    FullModel::new(
        data.id,
        ChannelModel {
            channel_type: data.channel_type.clone(),
            active_user_count: data.active_member_count,
            new_chat_count: data.unread_count,
            last_chat_log_id: data.last_log_id,
            last_seen_log_id: data.last_seen_log_id,
            push_alert: data.push_alert,
            last_update: data.last_update,
        },
    )
}

pub fn channel_data_from_channel_model(model: &ChannelModel) -> ChannelData {
    ChannelData {
        channel_type: model.channel_type.clone(),
        last_log_id: model.last_chat_log_id,
        last_seen_log_id: model.last_seen_log_id,
        last_chat: None,
        active_user_count: model.active_user_count,
        unread_count: 0,
        push_alert: model.push_alert,
        last_update: model.last_update,
    }
}

// TODO:: use trait
pub fn channel_user_model_from_user_variant(
    channel_id: ChannelId,
    watermark: LogId,
    user: &UserVariant,
) -> FullModel<ChannelUserId, ChannelUserModel> {
    match *user {
        UserVariant::Normal(ref user) => FullModel::new(
            user.user_id,
            ChannelUserModel {
                channel_id,
                nickname: user.nickname.clone(),
                profile_url: user.profile_image_url.clone(),
                full_profile_url: user.full_profile_image_url.clone(),
                original_profile_url: user.original_profile_image_url.clone(),
                user_type: user.user_type,
                watermark,
            },
        ),

        UserVariant::Open(ref user) => FullModel::new(
            user.user_id,
            ChannelUserModel {
                channel_id,
                nickname: user.nickname.clone(),
                profile_url: user.profile_image_url.clone(),
                full_profile_url: user.full_profile_image_url.clone(),
                original_profile_url: user.original_profile_image_url.clone(),
                user_type: user.user_type,
                watermark,
            },
        ),
    }
}
