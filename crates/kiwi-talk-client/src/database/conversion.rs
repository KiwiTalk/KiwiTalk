use crate::{chat::LogId, channel::ChannelId, user::ChannelUserId};

use super::{
    channel::model::{ChannelUserModel},
    chat::model::{ChatModel},
    model::FullModel,
};
use talk_loco_command::structs::{chat::Chatlog, user::UserVariant};

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
