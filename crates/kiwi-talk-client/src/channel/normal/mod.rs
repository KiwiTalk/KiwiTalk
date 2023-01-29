pub mod user;

use std::{ops::Deref, time::SystemTime};

use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{
    request::chat::{ChatInfoReq, ChatOnRoomReq, MemberReq, NotiReadReq},
    response::chat::chat_on_room::ChatOnRoomUserList,
    structs::user::UserVariant,
};

use crate::{
    chat::LogId,
    database::channel::{
        normal::{
            user::{NormalUserDatabaseExt, NormalUserModel},
            NormalChannelDatabaseExt, NormalChannelModel,
        },
        user::{UserDatabaseExt, UserModel},
        ChannelDatabaseExt,
    },
    ClientResult,
};

use super::{user::UserData, ChannelData, ClientChannel, ChannelInitialData};

#[derive(Debug, Clone)]
pub struct NormalChannelData {
    pub common: ChannelData,

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

    pub async fn chat_on(&self) -> ClientResult<()> {
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
            .spawn_task(move |mut connection| {
                let transaction = connection.transaction()?;

                transaction
                    .channel()
                    .set_last_chat_log_id(channel_id, res.last_log_id)?;

                for user in users {
                    if let UserVariant::Normal(user) = user {
                        let id = user.user_id;
                        let data = UserData::from(user);

                        transaction.user().insert(&UserModel {
                            id,
                            channel_id,
                            user_type: data.user_type,
                            profile: data.profile,
                            watermark: 0,
                        })?;

                        transaction.normal_user().insert(&NormalUserModel {
                            id,
                            channel_id,
                            info: data.info,
                        })?;
                    }
                }

                for (id, watermark) in res.watermark_user_ids.into_iter().zip(res.watermarks) {
                    transaction
                        .user()
                        .update_watermark(id, channel_id, watermark)?;
                }

                transaction.commit()?;
                Ok(())
            })
            .await?;

        Ok(())
    }

    pub async fn initialize(self) -> ClientResult<NormalChannelData> {
        let res = TalkClient(&self.connection.session)
            .channel_info(&ChatInfoReq { chat_id: self.id })
            .await?;

        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs() as _;

        let joined_at_for_new_mem = res.chat_info.joined_at_for_new_mem.unwrap_or_default();

        let initial = ChannelInitialData::from(res.chat_info);
        {
            let model = initial.create_channel_model(now);

            let normal_model = NormalChannelModel {
                id: self.id,
                joined_at_for_new_mem,
            };

            self.connection
                .pool
                .spawn_task(move |connection| {
                    connection.channel().insert(&model)?;
                    connection.normal_channel().insert(&normal_model)?;

                    Ok(())
                })
                .await?;
        }

        Ok(NormalChannelData {
            joined_at_for_new_mem,
            common: initial.data,
        })
    }
}

impl<'a> Deref for ClientNormalChannel<'a> {
    type Target = ClientChannel<'a>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
