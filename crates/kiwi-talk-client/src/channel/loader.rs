use futures::{stream::FuturesUnordered, TryStreamExt};
use talk_loco_command::structs::channel_info::ChannelListData;

use crate::{
    database::channel::{normal::NormalChannelDatabaseExt, ChannelDatabaseExt},
    error::KiwiTalkClientError,
    ClientConnection, ClientResult,
};

use super::{
    normal::{ClientNormalChannel, NormalChannelData},
    ChannelDataVariant, ChannelId, ClientChannel,
};

pub async fn load_channel_data<C: Default + Extend<(ChannelId, ChannelDataVariant)>>(
    connection: &ClientConnection,
    channel_list_data_iter: impl IntoIterator<Item = ChannelListData>,
) -> ClientResult<C> {
    let update_map = connection
        .pool
        .spawn_task(move |connection| Ok(connection.channel().get_update_map()?))
        .await?;

    let connection = &connection;

    channel_list_data_iter
        .into_iter()
        .map(|list_data| {
            let should_update = update_map
                .get(&list_data.id)
                .map(|last_update| *last_update < list_data.last_update)
                .unwrap_or(true);

            (should_update, list_data)
        })
        .map(|(should_update, list_data)| async move {
            let id = list_data.id;

            let variant = if list_data.link.is_some() {
                ChannelDataVariant::Open(())
            } else {
                ChannelDataVariant::Normal(
                    load_normal_channel(connection, should_update, list_data).await?,
                )
            };

            Ok::<_, KiwiTalkClientError>((id, variant))
        })
        .collect::<FuturesUnordered<_>>()
        .try_collect()
        .await
}

async fn load_normal_channel(
    connection: &ClientConnection,
    should_update: bool,
    list_data: ChannelListData,
) -> ClientResult<NormalChannelData> {
    if !should_update {
        let data = {
            let id = list_data.id;

            connection
                .pool
                .spawn_task(move |connection| Ok(connection.normal_channel().load_data(id)?))
                .await?
        };

        if let Some(data) = data {
            return Ok(data);
        }
    }

    ClientNormalChannel::new(ClientChannel::new(list_data.id, connection))
            .initialize()
            .await
}
