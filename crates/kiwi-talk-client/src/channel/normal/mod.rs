pub mod user;

use std::{ops::Deref, time::SystemTime};

use arrayvec::ArrayVec;
use serde::{Deserialize, Serialize};
use talk_loco_client::{
    structs::{channel::ChannelInfo, user::UserVariant},
    talk::{ChannelInfoReq, ChatOnChannelReq, GetUsersReq, NotiReadReq, TalkSession},
};

use crate::{
    chat::LogId,
    database::channel::{
        normal::{
            user::{NormalUserDatabaseExt, NormalUserModel},
            NormalChannelDatabaseExt, NormalChannelModel,
        },
        user::{InitialUserModel, UserDatabaseExt},
        ChannelDatabaseExt,
    },
    ClientResult,
};

use self::user::NormalUserData;

use super::{
    user::{DisplayUser, UserId},
    ChannelData, ClientChannel,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NormalChannelData {
    pub display_users: ArrayVec<DisplayUser, 4>,

    pub joined_at_for_new_mem: Option<i64>,
    pub inviter_id: Option<UserId>,

    pub common: ChannelData,
}

impl NormalChannelData {
    pub fn create_model(&self, id: i64) -> NormalChannelModel {
        NormalChannelModel {
            id,
            joined_at_for_new_mem: self.joined_at_for_new_mem,
            inviter_id: self.inviter_id,
        }
    }
}

impl From<ChannelInfo> for NormalChannelData {
    fn from(info: ChannelInfo) -> Self {
        Self {
            display_users: info
                .display_members
                .iter()
                .cloned()
                .map(DisplayUser::from)
                .collect::<ArrayVec<DisplayUser, 4>>(),

            joined_at_for_new_mem: info.joined_at_for_new_mem,
            inviter_id: info.inviter_id,

            common: ChannelData::from(info),
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub struct ClientNormalChannel<'a>(pub ClientChannel<'a>);

impl<'a> ClientNormalChannel<'a> {
    #[inline(always)]
    pub const fn new(channel: ClientChannel<'a>) -> Self {
        Self(channel)
    }

    pub async fn read_chat(&self, log_id: LogId) -> ClientResult<()> {
        TalkSession(&self.client.session)
            .noti_read(&NotiReadReq {
                chat_id: self.id,
                watermark: log_id,
                link_id: None,
            })
            .await?;

        let client_user_id = self.client.user_id();
        let channel_id = self.id;
        self.client
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

    pub async fn chat_on(&self) -> ClientResult<Vec<NormalUserData>> {
        let res = TalkSession(&self.client.session)
            .chat_on_channel(&ChatOnChannelReq {
                chat_id: self.id,
                token: 0,
                open_token: None,
            })
            .await?;

        let users = if let Some(users) = res.users {
            users
                .into_iter()
                .filter_map(|user| {
                    if let UserVariant::Normal(user) = user {
                        Some(NormalUserData::from(user))
                    } else {
                        None
                    }
                })
                .collect()
        } else if let Some(ref user_ids) = res.user_ids {
            self.get_user_data_inner(user_ids).await?
        } else {
            Vec::new()
        };

        self.client
            .pool
            .spawn_task({
                let users = users.clone();
                let channel_id = self.id;

                move |mut connection| {
                    let transaction = connection.transaction()?;

                    for user in users {
                        transaction
                            .user()
                            .insert_or_update_profile(&InitialUserModel {
                                id: user.id,
                                channel_id,
                                profile: user.profile,
                            })?;

                        transaction.normal_user().insert(&NormalUserModel {
                            id: user.id,
                            channel_id,
                            info: user.info,
                        })?;
                    }

                    for (id, watermark) in res.watermark_user_ids.into_iter().zip(res.watermarks) {
                        transaction
                            .user()
                            .update_watermark(id, channel_id, watermark)?;
                    }

                    transaction.commit()?;
                    Ok(())
                }
            })
            .await?;

        self.sync_chats(res.last_log_id).await?;

        Ok(users)
    }

    async fn get_user_data_inner(&self, user_ids: &[UserId]) -> ClientResult<Vec<NormalUserData>> {
        if user_ids.is_empty() {
            return Ok(Vec::new());
        }

        let res = TalkSession(&self.client.session)
            .get_users(&GetUsersReq {
                chat_id: self.id,
                user_ids,
            })
            .await?;

        Ok(res
            .members
            .into_iter()
            .filter_map(|user| {
                if let UserVariant::Normal(user) = user {
                    Some(NormalUserData::from(user))
                } else {
                    None
                }
            })
            .collect::<Vec<_>>())
    }

    pub async fn initialize(&self) -> ClientResult<NormalChannelData> {
        let res = TalkSession(&self.client.session)
            .channel_info(&ChannelInfoReq { chat_id: self.id })
            .await?;

        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs() as _;

        let display_users = res
            .chat_info
            .display_members
            .iter()
            .cloned()
            .map(DisplayUser::from)
            .collect::<ArrayVec<DisplayUser, 4>>();

        let users = self
            .get_user_data_inner(
                &display_users
                    .iter()
                    .map(|user| user.id)
                    .collect::<ArrayVec<UserId, 4>>(),
            )
            .await?;

        let last_log_id = res.chat_info.last_log_id;

        let data = NormalChannelData::from(res.chat_info);
        {
            let model = data.common.create_model(self.id, now);
            let normal_model = data.create_model(self.id);

            let channel_id = self.id;

            self.client
                .pool
                .spawn_task(move |mut connection| {
                    let transaction = connection.transaction()?;

                    transaction.channel().insert(&model)?;
                    transaction.normal_channel().insert(&normal_model)?;

                    for user in users {
                        transaction
                            .user()
                            .insert_or_update_profile(&InitialUserModel {
                                id: user.id,
                                channel_id,
                                profile: user.profile,
                            })?;

                        transaction.normal_user().insert(&NormalUserModel {
                            id: user.id,
                            channel_id,
                            info: user.info,
                        })?;
                    }

                    transaction.commit()?;
                    Ok(())
                })
                .await?;
        }

        self.sync_chats(last_log_id).await?;

        Ok(data)
    }
}

impl<'a> Deref for ClientNormalChannel<'a> {
    type Target = ClientChannel<'a>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
