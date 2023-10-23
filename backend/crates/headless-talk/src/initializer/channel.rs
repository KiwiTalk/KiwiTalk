use diesel::RunQueryDsl;
use futures_loco_protocol::session::LocoSession;
use talk_loco_client::talk::session::{channel::info::ChannelInfoType, TalkSession};

use crate::{
    database::{
        model::{
            channel::{meta::ChannelMetaRow, normal::NormalChannelRow},
            user::{normal::NormalChannelUserRow, UserProfileRow},
        },
        schema::{channel_meta, normal_channel, normal_channel_user, user_profile},
        DatabasePool,
    },
    ClientResult,
};

#[derive(Debug)]
pub struct ChannelInitializer<'a> {
    session: &'a LocoSession,
    pool: &'a DatabasePool,

    id: i64,
}

impl<'a> ChannelInitializer<'a> {
    pub fn new(session: &'a LocoSession, pool: &'a DatabasePool, id: i64) -> Self {
        Self { session, pool, id }
    }

    pub async fn initialize(self) -> ClientResult<()> {
        let res = TalkSession(self.session).channel(self.id).info().await?;

        let meta_rows = res
            .channel_metas
            .into_iter()
            .map(|meta| ChannelMetaRow {
                channel_id: self.id,
                meta_type: meta.meta_type,
                author_id: meta.author_id,
                revision: meta.revision,
                content: meta.content,
                updated_at: meta.updated_at,
            })
            .collect::<Vec<_>>();

        match res.channel_type {
            ChannelInfoType::DirectChat(normal)
            | ChannelInfoType::MultiChat(normal)
            | ChannelInfoType::MemoChat(normal) => {
                let list = TalkSession(self.session)
                    .normal_channel(self.id)
                    .list_users()
                    .await?;

                self.pool
                    .spawn(move |conn| {
                        let profiles = list
                            .iter()
                            .map(|user| UserProfileRow {
                                id: user.user_id,
                                channel_id: self.id,
                                nickname: &user.nickname,
                                profile_url: user.profile_image_url.as_deref(),
                                full_profile_url: user.full_profile_image_url.as_deref(),
                                original_profile_url: user.original_profile_image_url.as_deref(),
                            })
                            .collect::<Vec<_>>();

                        let users = list
                            .iter()
                            .map(|user| NormalChannelUserRow {
                                id: user.user_id,
                                channel_id: self.id,
                                country_iso: &user.country_iso,
                                account_id: user.account_id,
                                status_message: &user.status_message,
                                linked_services: &user.linked_services,
                                suspended: user.suspended,
                            })
                            .collect::<Vec<_>>();

                        diesel::replace_into(channel_meta::table)
                            .values(meta_rows)
                            .execute(conn)?;

                        diesel::replace_into(user_profile::table)
                            .values(profiles)
                            .execute(conn)?;

                        diesel::replace_into(normal_channel_user::table)
                            .values(users)
                            .execute(conn)?;

                        diesel::replace_into(normal_channel::table)
                            .values(NormalChannelRow {
                                id: self.id,
                                joined_at_for_new_mem: Some(normal.joined_at_for_new_mem),
                                inviter_user_id: normal.inviter_id,
                            })
                            .execute(conn)?;

                        Ok(())
                    })
                    .await?;
            }

            ChannelInfoType::OpenMulti(open) | ChannelInfoType::OpenDirect(open) => {
                let list = TalkSession(self.session)
                    .open_channel(self.id, open.link_id)
                    .list_users()
                    .await?;

                self.pool
                    .spawn(move |conn| {
                        let profiles = list
                            .iter()
                            .map(|user| UserProfileRow {
                                id: user.user_id,
                                channel_id: self.id,
                                nickname: &user.nickname,
                                profile_url: user.profile_image_url.as_deref(),
                                full_profile_url: user.full_profile_image_url.as_deref(),
                                original_profile_url: user.original_profile_image_url.as_deref(),
                            })
                            .collect::<Vec<_>>();

                        diesel::replace_into(channel_meta::table)
                            .values(meta_rows)
                            .execute(conn)?;

                        diesel::replace_into(user_profile::table)
                            .values(profiles)
                            .execute(conn)?;

                        Ok(())
                    })
                    .await?;
            }

            ChannelInfoType::Other => return Ok(()),
        }

        Ok(())
    }
}
