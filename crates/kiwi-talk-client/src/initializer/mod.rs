pub mod channel;

use futures::{pin_mut, StreamExt};
use talk_loco_client::client::talk::TalkClient;
use talk_loco_command::{response::chat::LoginListRes, structs::channel_info::ChannelListData};

use crate::{
    channel::normal::NormalChannelDataList, database::pool::DatabasePool, ClientConnection,
    ClientResult, ClientShared,
};

pub async fn initialize_client(
    connection: ClientConnection,
    login_res: LoginListRes,
) -> ClientResult<ClientShared> {
    let mut normal_list = Vec::new();
    let mut open_list = Vec::new();

    for data in login_res.chat_list.chat_datas {
        if data.link.is_some() {
            open_list.push(data);
        } else {
            normal_list.push(data);
        }
    }

    if !login_res.chat_list.eof {
        let talk_client = TalkClient(&connection.session);
        let stream = talk_client.channel_list_stream(
            login_res.chat_list.last_token_id.unwrap_or_default(),
            login_res.chat_list.last_chat_id,
        );

        pin_mut!(stream);
        while let Some(res) = stream.next().await {
            let res = res?;

            for data in res.chat_datas {
                if data.link.is_some() {
                    open_list.push(data);
                } else {
                    normal_list.push(data);
                }
            }
        }
    }

    let normal_channel_list = init_normal_channel_list(&connection.pool).await?;
    let _ = init_open_channel_list(&connection.pool).await?;

    let client = ClientShared {
        connection,

        normal_channel_list,
    };

    update_normal_channel_list(&client, normal_list).await?;

    Ok(client)
}

async fn init_normal_channel_list(pool: &DatabasePool) -> ClientResult<NormalChannelDataList> {
    let normal_channel_list = NormalChannelDataList::new();

    let model_list = pool
        .spawn_task(|connection| Ok(connection.channel().get_all_normal_channel()?))
        .await?;

    for full_model in model_list {}

    Ok(normal_channel_list)
}

async fn update_normal_channel_list(
    client: &ClientShared,
    server_list: Vec<ChannelListData>,
) -> ClientResult<()> {
    for data in server_list {}

    Ok(())
}

async fn init_open_channel_list(_: &DatabasePool) -> ClientResult<()> {
    Ok(())
}
