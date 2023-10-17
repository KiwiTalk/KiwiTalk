use arrayvec::ArrayVec;
use nohash_hasher::IntMap;
use talk_loco_client::{
    futures_loco_protocol::session::LocoSession,
    structs::{channel::ChannelInfo, user::UserVariant},
    talk::session::{
        load_channel_list::response::ChannelListData as LocoChannelListData, ChannelInfoReq,
        GetAllUsersReq, TalkSession,
    },
    RequestError,
};
use thiserror::Error;

use crate::database::{
    channel::{user::UserDatabaseExt, ChannelDatabaseExt, ChannelMetaRow, ChannelUpdateRow},
    pool::{DatabasePool, PoolTaskError},
};

use super::{user::UserProfile, ChannelId, ChannelMeta};

#[derive(Debug, Clone)]
pub struct ChannelUpdater<'a> {
    session: &'a LocoSession,
    pool: &'a DatabasePool,
}

impl<'a> ChannelUpdater<'a> {
    pub(crate) fn new(session: &'a LocoSession, pool: &'a DatabasePool) -> Self {
        Self { session, pool }
    }
}

impl ChannelUpdater<'_> {
    pub async fn update(
        self,
        iter: impl IntoIterator<Item = LocoChannelListData> + Send + 'static,
    ) -> Result<(), UpdateError> {
        let update_map: IntMap<ChannelId, i64> = self
            .pool
            .spawn_task(|conn| Ok(conn.channel().get_update_map()?))
            .await?;

        let mut update_list = Vec::<(ChannelUpdateRow, ChannelInfo, Vec<UserVariant>)>::new();

        for list_data in iter {
            if update_map
                .get(&list_data.id)
                .map(|&last_update| last_update >= list_data.last_update)
                .unwrap_or(false)
            {
                continue;
            }

            let info = TalkSession(&self.session)
                .channel_info(&ChannelInfoReq {
                    chat_id: list_data.id,
                })
                .await?
                .chat_info;

            let members = TalkSession(&self.session)
                .get_all_users(&GetAllUsersReq {
                    chat_id: list_data.id,
                })
                .await?
                .members;

            let row = ChannelUpdateRow {
                id: list_data.id,
                channel_type: list_data.channel_type,

                display_users: {
                    let mut vec = ArrayVec::new();

                    if let Some(ids) = list_data.icon_user_ids {
                        vec.extend(ids.into_iter().take(4));
                    }

                    vec
                },

                last_seen_log_id: list_data.last_seen_log_id,
                last_update: list_data.last_update,
            };

            update_list.push((row, info, members));
        }

        self.pool
            .spawn_task(move |mut conn| {
                let transaction = conn.transaction()?;

                for (row, info, members) in update_list {
                    transaction.channel().insert_or_replace(&row)?;

                    for meta in info.channel_metas {
                        transaction
                            .channel()
                            .insert_or_replace_meta(&ChannelMetaRow {
                                channel_id: row.id,
                                meta_type: meta.meta_type,
                                meta: ChannelMeta::from(meta),
                            })?;
                    }

                    for user in members {
                        let id = user.id();

                        let profile = UserProfile::from(user);

                        transaction
                            .user()
                            .insert_or_update_profile(id, row.id, &profile)?;
                    }
                }

                transaction.commit()?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}

#[derive(Debug, Error)]
pub enum UpdateError {
    #[error(transparent)]
    Request(#[from] RequestError),

    #[error(transparent)]
    Pool(#[from] PoolTaskError),
}
