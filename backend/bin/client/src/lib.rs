mod channel;
mod channel_list;
mod conn;
mod constants;
mod event;
mod handler;

use channel::ChannelMap;
use handler::handle_event;
use kiwi_talk_api::auth::CredentialState;
use parking_lot::RwLock;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::{sync::Arc, task::Poll};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use anyhow::{anyhow, Context};
use futures::{future::poll_fn, ready};
use headless_talk::{
    config::ClientEnv,
    updater::{Credential, TalkInitializer},
    ClientStatus, HeadlessTalk,
};
use talk_loco_client::futures_loco_protocol::LocoClient;
use tokio::sync::mpsc;

use kiwi_talk_result::TauriResult;
use kiwi_talk_system::get_system_info;

use conn::checkin;
use constants::{TALK_APP_VERSION, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS};

use self::{conn::create_secure_stream, event::MainEvent};

pub async fn init_plugin<R: Runtime>(name: &'static str) -> anyhow::Result<TauriPlugin<R>> {
    Ok(Builder::new(name)
        .setup(move |handle| {
            handle.manage::<RwLock<Option<Client>>>(RwLock::new(None));
            handle.manage(ChannelMap::new());

            Ok(())
        })
        .invoke_handler(generate_handler![
            created,
            create,
            destroy,
            next_main_event,
            channel_list::channel_list,
            channel::open_channel,
            channel::channel_send_text,
            channel::channel_read_chat,
            channel::close_channel,
            channel::channel_load_chat,
        ])
        .build())
}

type ClientState<'a> = tauri::State<'a, RwLock<Option<Client>>>;

#[tauri::command]
fn created(state: ClientState<'_>) -> bool {
    state.read().is_some()
}

#[derive(Clone, Deserialize, Copy)]
enum Status {
    Unlocked,
    Locked,
}

impl From<Status> for ClientStatus {
    fn from(val: Status) -> Self {
        match val {
            Status::Unlocked => ClientStatus::Unlocked,
            Status::Locked => ClientStatus::Locked,
        }
    }
}

#[tauri::command(async)]
async fn create(
    status: Status,
    cred: CredentialState<'_>,
    state: ClientState<'_>,
) -> TauriResult<i32> {
    let Some((user_id, access_token)) = cred
        .read()
        .as_ref()
        .map(|cred| (cred.user_id, cred.access_token.clone()))
    else {
        return Err(anyhow!("not logon").into());
    };

    let client = create_client(
        status.into(),
        Credential {
            access_token: &access_token,
            device_uuid: &get_system_info().device.device_uuid,
        },
        user_id as _,
    )
    .await
    .context("cannot create client")?;

    *state.write() = Some(client);

    Ok(0)
}

#[tauri::command]
fn destroy(state: ClientState<'_>) -> bool {
    state.write().take().is_some()
}

#[tauri::command(async)]
async fn next_main_event(client: ClientState<'_>) -> TauriResult<Option<MainEvent>> {
    Ok(poll_fn(|cx| {
        let mut client = client.write();

        let read = match &mut *client {
            Some(client) => ready!(client.event_rx.poll_recv(cx)),
            _ => return Poll::Ready(None),
        };

        Poll::Ready(read)
    })
    .await
    .transpose()?)
}

#[derive(Debug)]
struct Client {
    talk: Arc<HeadlessTalk>,
    event_rx: mpsc::Receiver<anyhow::Result<MainEvent>>,
}

async fn create_client(
    status: ClientStatus,
    credential: Credential<'_>,
    user_id: i64,
) -> anyhow::Result<Client> {
    let info = get_system_info();

    let user_dir = info.data_dir.join("userdata").join({
        let mut digest = Sha256::new();

        digest.update("user_");
        digest.update(format!("{user_id}"));

        hex::encode(digest.finalize())
    });

    tokio::fs::create_dir_all(&user_dir)
        .await
        .context("cannot create user directory")?;

    let checkin = checkin(user_id).await?;

    let client = LocoClient::new(
        create_secure_stream((checkin.host.as_str(), checkin.port as u16))
            .await
            .context("failed to create secure stream")?,
    );

    let initializer = TalkInitializer::new(
        client,
        ClientEnv {
            os: TALK_OS,
            net_type: TALK_NET_TYPE,
            app_version: TALK_APP_VERSION,
            mccmnc: TALK_MCCMNC,
            language: info.device.language(),
        },
        user_dir.join("client.db").to_string_lossy(),
    )
    .await
    .context("failed to login")?;

    let (event_tx, event_rx) = mpsc::channel(100);

    let talk = initializer
        .login(credential, status, move |res| {
            let event_tx = event_tx.clone();

            async move {
                match res {
                    Ok(event) => {
                        if let Err(err) = handle_event(event, event_tx.clone()).await {
                            let _ = event_tx.send(Err(err)).await;
                        }
                    }

                    Err(err) => {
                        let _ = event_tx.send(Err(err.into())).await;
                    }
                }
            }
        })
        .await
        .context("failed to initialize client")?;

    Ok(Client {
        talk: Arc::new(talk),
        event_rx,
    })
}
