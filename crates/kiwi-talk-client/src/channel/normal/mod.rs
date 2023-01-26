pub mod user;

use std::ops::Deref;

use dashmap::{
    mapref::one::{Ref, RefMut},
    DashMap,
};
use nohash_hasher::BuildNoHashHasher;
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{
    request::chat::{ChatOnRoomReq, MemberReq, NotiReadReq},
    response::chat::chat_on_room::ChatOnRoomUserList,
    structs::user::UserVariant,
};

use crate::{
    chat::LogId,
    database::channel::{
        normal::user::{NormalUserDatabaseExt, NormalUserModel},
        user::{UserDatabaseExt, UserModel},
        ChannelDatabaseExt,
    },
    ClientResult,
};

use super::{user::UserData, ChannelData, ChannelId, ClientChannel, ClientChannelList};

#[derive(Debug)]
pub struct NormalChannelDataList {
    data_map: DashMap<ChannelId, NormalChannelData, BuildNoHashHasher<ChannelId>>,
}

impl NormalChannelDataList {
    #[inline(always)]
    pub(crate) fn new() -> Self {
        Self {
            data_map: DashMap::default(),
        }
    }

    #[inline(always)]
    pub(crate) fn data_map(
        &self,
    ) -> &DashMap<ChannelId, NormalChannelData, BuildNoHashHasher<ChannelId>> {
        &self.data_map
    }

    #[inline(always)]
    pub fn get(&self, channel_id: &ChannelId) -> Option<NormalChannelDataRef> {
        self.data_map.get(&channel_id)
    }

    #[inline(always)]
    pub fn len(&self) -> usize {
        self.data_map.len()
    }

    #[inline(always)]
    pub fn contains(&self, channel_id: &ChannelId) -> bool {
        self.data_map.contains_key(channel_id)
    }

    #[inline(always)]
    pub fn iter(&self) -> impl Iterator<Item = impl Deref<Target = NormalChannelData> + '_> {
        self.data_map.iter()
    }
}

impl Default for NormalChannelDataList {
    fn default() -> Self {
        Self::new()
    }
}

pub type ClientNormalChannelList<'a> = ClientChannelList<'a, NormalChannelDataList>;

impl<'a> ClientNormalChannelList<'a> {
    pub fn channel(&self, id: ChannelId) -> Option<ClientNormalChannel<'a>> {
        Some(ClientNormalChannel::new(
            id,
            &self.connection,
            self.inner.data_map().get_mut(&id)?,
        ))
    }
}

#[derive(Debug, Clone)]
pub struct NormalChannelData {
    pub data: ChannelData,
}

impl AsRef<ChannelData> for NormalChannelData {
    fn as_ref(&self) -> &ChannelData {
        &self.data
    }
}

impl AsMut<ChannelData> for NormalChannelData {
    fn as_mut(&mut self) -> &mut ChannelData {
        &mut self.data
    }
}

pub type NormalChannelDataRef<'a> =
    Ref<'a, ChannelId, NormalChannelData, BuildNoHashHasher<ChannelId>>;
pub type NormalChannelDataMut<'a> =
    RefMut<'a, ChannelId, NormalChannelData, BuildNoHashHasher<ChannelId>>;

pub type ClientNormalChannel<'a> = ClientChannel<'a, NormalChannelDataMut<'a>>;

impl<'a> ClientNormalChannel<'a> {
    pub async fn read_chat(&mut self, log_id: LogId) -> ClientResult<()> {
        TalkClient(&self.connection.session)
            .read_chat_normal(&NotiReadReq {
                chat_id: self.id,
                watermark: log_id,
            })
            .await?;

        let client_user_id = self.connection.user_id;
        let channel_id = self.id;
        self.connection
            .pool
            .spawn_task(move |connection| {
                connection
                    .channel()
                    .set_last_seen_log_id(channel_id, log_id)?;
                connection
                    .user()
                    .update_watermark(client_user_id, channel_id, log_id)?;

                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn chat_on(&mut self) -> ClientResult<()> {
        let res = TalkClient(&self.connection.session)
            .chat_on_normal_channel(&ChatOnRoomReq {
                chat_id: self.id,
                token: 0,
            })
            .await?;

        self.sync_chats(res.last_log_id).await?;

        let users = match res.users {
            ChatOnRoomUserList::Info(users) => users,
            ChatOnRoomUserList::Id(user_ids) => {
                let res = TalkClient(&self.connection.session)
                    .user_info(&MemberReq {
                        chat_id: self.id,
                        user_ids,
                    })
                    .await?;

                res.members
            }
        };

        let channel_id = self.id;
        self.connection
            .pool
            .spawn_task(move |connection| {
                connection
                    .channel()
                    .set_last_chat_log_id(channel_id, res.last_log_id)?;

                for user in users {
                    if let UserVariant::Normal(user) = user {
                        let id = user.user_id;
                        let data = UserData::from(user);

                        connection.user().insert(&UserModel {
                            id,
                            channel_id,
                            profile: data.profile,
                            watermark: 0,
                        })?;

                        connection.normal_user().insert(&NormalUserModel {
                            id,
                            channel_id,
                            info: data.info,
                        });
                    }
                }

                for (id, watermark) in res.watermark_user_ids.into_iter().zip(res.watermarks) {
                    connection
                        .user()
                        .update_watermark(id, channel_id, watermark)?;
                }

                Ok(())
            })
            .await?;

        Ok(())
    }
}
