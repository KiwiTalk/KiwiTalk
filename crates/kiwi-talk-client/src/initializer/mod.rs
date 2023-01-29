pub mod channel;

use futures::{stream::FuturesUnordered, TryStreamExt};
use talk_loco_command::structs::channel_info::ChannelListData;

use crate::{
    channel::{normal::ClientNormalChannel, ChannelDataVariant, ClientChannel},
    database::channel::ChannelDatabaseExt,
    error::KiwiTalkClientError,
    ClientConnection, ClientResult,
};

pub async fn load_channel_data(
    connection: &ClientConnection,
    channel_list_data_iter: impl IntoIterator<Item = ChannelListData>,
) -> ClientResult<Vec<ChannelDataVariant>> {
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
            if list_data.link.is_some() {
                // TODO::
            } else {
                init_normal_channel(connection, should_update, list_data).await?;
            }

            Ok::<(), KiwiTalkClientError>(())
        })
        .collect::<FuturesUnordered<_>>()
        .try_collect()
        .await?;

    Ok(vec![])
}

async fn init_normal_channel(
    connection: &ClientConnection,
    should_update: bool,
    list_data: ChannelListData,
) -> ClientResult<()> {
    ClientNormalChannel::new(ClientChannel::new(list_data.id, connection))
        .initialize()
        .await?;

    if should_update {
        Ok(())
    } else {
        // TODO
        Ok(())
    }
}
