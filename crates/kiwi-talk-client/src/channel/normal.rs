use dashmap::{mapref::one::Ref, DashMap};
use kiwi_talk_db::channel::model::ChannelId;
use nohash_hasher::BuildNoHashHasher;

use super::{ChannelData, ClientChannel};

#[derive(Debug, Clone)]
pub struct NormalChannelData {
    pub data: ChannelData,
}

pub type NormalChannelDataRef<'a> =
    Ref<'a, ChannelId, NormalChannelData, BuildNoHashHasher<ChannelId>>;
pub type ClientNormalChannel<'a> = ClientChannel<'a, NormalChannelDataRef<'a>>;

#[derive(Debug)]
pub struct NormalChannelList {
    data_map: DashMap<ChannelId, NormalChannelData, BuildNoHashHasher<ChannelId>>,
}

impl NormalChannelList {
    #[inline(always)]
    pub fn get_data(&self, channel_id: ChannelId) -> Option<NormalChannelDataRef> {
        self.data_map.get(&channel_id)
    }
}
