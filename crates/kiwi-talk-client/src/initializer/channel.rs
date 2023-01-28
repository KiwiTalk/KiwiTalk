use talk_loco_command::structs::channel_info::ChannelInfo;

use crate::{
    channel::{ChannelData, ChannelId},
    chat::LogId,
    database::channel::{ChannelModel, ChannelTrackingData},
};

#[derive(Debug, Clone)]
pub struct ChannelInitialData {
    pub id: ChannelId,

    pub last_chat_log_id: LogId,
    pub last_seen_log_id: LogId,

    pub data: ChannelData,
}

impl From<ChannelInfo> for ChannelInitialData {
    fn from(info: ChannelInfo) -> Self {
        Self {
            id: info.chat_id,

            last_chat_log_id: info.last_log_id,
            last_seen_log_id: info.last_seen_log_id,

            data: ChannelData::from(info),
        }
    }
}

impl ChannelInitialData {
    pub fn create_channel_model(&self, last_update: i64) -> ChannelModel {
        ChannelModel {
            id: self.id,
            channel_type: self.data.channel_type.clone(),
            tracking_data: ChannelTrackingData {
                last_chat_log_id: self.last_chat_log_id,
                last_seen_log_id: self.last_seen_log_id,
                last_update,
            },
            settings: self.data.settings.clone(),
        }
    }
}
