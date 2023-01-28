pub mod channel;

use futures::{stream::FuturesUnordered, TryStreamExt};
use talk_loco_command::structs::channel_info::ChannelListData;

use crate::{
    channel::normal::{NormalChannelData, NormalChannelDataList, NormalChannelInitializer},
    database::channel::ChannelDatabaseExt,
    error::KiwiTalkClientError,
    ClientConnection, ClientResult, ClientShared,
};

pub async fn initialize_client(
    connection: ClientConnection,
    channel_list_data: Vec<ChannelListData>,
) -> ClientResult<ClientShared> {
    let normal_channel_list = NormalChannelDataList::new();

    {
        let channel_model_map = connection
            .pool
            .spawn_task(move |connection| Ok(connection.channel().get_all_map()?))
            .await?;

        let connection = &connection;

        let normal_channel_list = &normal_channel_list;

        channel_list_data
            .into_iter()
            .map(|list_data| {
                let should_update = channel_model_map
                    .get(&list_data.id)
                    .map(|model| model.tracking_data.last_update < list_data.last_update)
                    .unwrap_or(true);

                (should_update, list_data)
            })
            .map(|(should_update, list_data)| async move {
                if list_data.link.is_some() {
                    // TODO::
                } else {
                    let id = list_data.id;
                    let chan = init_normal_channel(connection, should_update, list_data).await?;
                    normal_channel_list.data_map().insert(id, chan);
                }

                Ok::<(), KiwiTalkClientError>(())
            })
            .collect::<FuturesUnordered<_>>()
            .try_collect()
            .await?;
    }

    let client = ClientShared {
        connection,

        normal_channel_list,
    };

    Ok(client)
}

async fn init_normal_channel(
    connection: &ClientConnection,
    should_update: bool,
    list_data: ChannelListData,
) -> ClientResult<NormalChannelData> {
    if should_update {
        Ok(NormalChannelInitializer::new(list_data.id, connection)
            .initialize()
            .await?)
    } else {
        // TODO
        Ok(NormalChannelInitializer::new(list_data.id, connection)
            .initialize()
            .await?)
    }
}
