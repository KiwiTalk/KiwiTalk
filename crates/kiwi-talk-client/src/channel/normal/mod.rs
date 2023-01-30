pub mod user;

use std::{ops::Deref, time::SystemTime};

use serde::{Deserialize, Serialize};
use smallvec::SmallVec;
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{
    request::chat::{ChatInfoReq, ChatOnRoomReq, MemberReq, NotiReadReq},
    structs::user::UserVariant,
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
    ChannelData, ChannelInitialData, ClientChannel,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NormalChannelData {
    pub common: ChannelData,

    pub display_users: SmallVec<[DisplayUser; 4]>,

    pub joined_at_for_new_mem: i64,
}

#[derive(Debug, Clone, Copy)]
pub struct ClientNormalChannel<'a>(pub ClientChannel<'a>);

impl<'a> ClientNormalChannel<'a> {
    #[inline(always)]
    pub const fn new(channel: ClientChannel<'a>) -> Self {
        Self(channel)
    }

    pub async fn read_chat(&self, log_id: LogId) -> ClientResult<()> {
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

    pub async fn chat_on(&self) -> ClientResult<Vec<NormalUserData>> {
        let res = TalkClient(&self.connection.session)
            .chat_on_normal_channel(&ChatOnRoomReq {
                chat_id: self.id,
                token: 0,
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
        } else if let Some(user_ids) = res.user_ids {
            self.get_user_data_inner(user_ids).await?
        } else {
            Vec::new()
        };

        self.connection
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

    async fn get_user_data_inner(
        &self,
        user_ids: Vec<UserId>,
    ) -> ClientResult<Vec<NormalUserData>> {
        if user_ids.is_empty() {
            return Ok(Vec::new());
        }

        let res = TalkClient(&self.connection.session)
            .user_info(&MemberReq {
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
        let res = TalkClient(&self.connection.session)
            .channel_info(&ChatInfoReq { chat_id: self.id })
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
            .collect::<SmallVec<[DisplayUser; 4]>>();

        let users = self
            .get_user_data_inner(display_users.iter().map(|user| user.id).collect())
            .await?;

        let joined_at_for_new_mem = res.chat_info.joined_at_for_new_mem.unwrap_or_default();

        let initial = ChannelInitialData::from(res.chat_info);
        {
            let model = initial.create_channel_model(now);

            let normal_model = NormalChannelModel {
                id: self.id,
                joined_at_for_new_mem,
            };

            let channel_id = self.id;

            self.connection
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

        let channel_data = NormalChannelData {
            display_users,
            joined_at_for_new_mem,
            common: initial.data,
        };

        Ok(channel_data)
    }
}

impl<'a> Deref for ClientNormalChannel<'a> {
    type Target = ClientChannel<'a>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
