use crate::{
    channel::{user::UserId, ChannelId},
    chat::LogId,
};

use super::{channel::model::ChannelUserModel, chat::model::ChatModel, model::FullModel};
use talk_loco_command::structs::{chat::Chatlog, user::UserVariant};

// TODO:: use trait
pub fn channel_user_model_from_user_variant(
    channel_id: ChannelId,
    watermark: LogId,
    user: &UserVariant,
) -> FullModel<UserId, ChannelUserModel> {
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
