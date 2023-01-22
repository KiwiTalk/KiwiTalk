use dashmap::DashMap;
use kiwi_talk_db::channel::model::ChannelId;

use super::KiwiTalkChannelData;

#[derive(Debug, Clone)]
pub struct KiwiTalkNormalChannelData {
    pub data: KiwiTalkChannelData
}

#[derive(Debug)]
pub struct KiwiTalkNormalChannelList {
    data_map: DashMap<ChannelId, KiwiTalkNormalChannelData, BuildNoHashHasher<ChannelId>>
}
