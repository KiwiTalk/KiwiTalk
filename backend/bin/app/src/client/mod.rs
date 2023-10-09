mod channel_list;
mod conn;
mod event;
mod handler;

use kiwi_talk_api::auth::CredentialState;
use parking_lot::RwLock;
use sha2::{Digest, Sha256};
use std::{task::Poll, time::Duration};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use anyhow::{anyhow, Context};
use futures::{future::poll_fn, ready, stream, StreamExt};
use kiwi_talk_client::{
    config::ClientConfig, database::pool::DatabasePool, handler::SessionHandler, ClientCredential,
    ClientStatus, KiwiTalkSession,
};
use talk_loco_client::{
    futures_loco_protocol::{session::LocoSession, LocoClient},
    talk::stream::TalkStream,
};
use tokio::{sync::mpsc, task::JoinHandle, time::sleep};

use kiwi_talk_result::TauriResult;
use kiwi_talk_system::get_system_info;

use crate::constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION};
use conn::checkin;

use self::{conn::create_secure_stream, event::MainEvent, handler::run_handler};

pub(super) async fn init_plugin<R: Runtime>(name: &'static str) -> anyhow::Result<TauriPlugin<R>> {
    Ok(Builder::new(name)
        .setup(move |handle| {
            handle.manage::<RwLock<Option<Client>>>(RwLock::new(None));

            Ok(())
        })
        .invoke_handler(generate_handler![
            created,
            create,
            destroy,
            next_main_event,
            channel_list::channel_list,
        ])
        .build())
}

type ClientState<'a> = tauri::State<'a, RwLock<Option<Client>>>;

#[tauri::command]
fn created(state: ClientState<'_>) -> bool {
    state.read().is_some()
}

#[tauri::command(async)]
async fn create(
    status: ClientStatus,
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
        status,
        ClientCredential {
            access_token: &access_token,
            device_uuid: &get_system_info().device_info.device_uuid,
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
    session: KiwiTalkSession,
    event_rx: mpsc::Receiver<anyhow::Result<MainEvent>>,
    stream_task: JoinHandle<()>,
    ping_task: JoinHandle<()>,
}

impl Drop for Client {
    fn drop(&mut self) {
        self.stream_task.abort();
        self.ping_task.abort();
    }
}

async fn create_client(
    status: ClientStatus,
    credential: ClientCredential<'_>,
    user_id: i64,
) -> anyhow::Result<Client> {
    let user_dir = get_system_info().data_dir.join("userdata").join({
        let mut digest = Sha256::new();

        digest.update("user_");
        digest.update(format!("{user_id}"));

        hex::encode(digest.finalize())
    });

    tokio::fs::create_dir_all(&user_dir)
        .await
        .context("cannot create user directory")?;

    let pool =
        DatabasePool::file(user_dir.join("database.db")).context("failed to open database")?;
    pool.migrate_to_latest()
        .await
        .context("failed to migrate database to latest")?;

    let checkin = checkin(user_id).await?;

    let (session, stream) = LocoSession::new(LocoClient::new(
        create_secure_stream((checkin.host.as_str(), checkin.port as u16))
            .await
            .context("failed to create secure stream")?,
    ));

    let mut stream = TalkStream::new(stream);

    let mut stream_buffer = Vec::new();

    let session = {
        let login_task = async {
            let info = get_system_info();

            KiwiTalkSession::login(
                session,
                pool,
                ClientConfig {
                    os: TALK_OS,
                    net_type: TALK_NET_TYPE,
                    app_version: TALK_VERSION,
                    mccmnc: TALK_MCCMNC,
                    language: info.device_info.language(),
                    device_type: TALK_DEVICE_TYPE,
                },
                credential,
                status,
            )
            .await
            .context("failed to login")
        };

        let stream_task = async {
            while let Some(read) = stream.next().await.transpose()? {
                stream_buffer.push(read);
            }

            Ok::<_, anyhow::Error>(())
        };

        tokio::select! {
            session = login_task => session?,
            res = stream_task => {
                res?;
                unreachable!();
            }
        }
    };

    let (event_tx, event_rx) = mpsc::channel(100);

    let handler = SessionHandler::new(&session);

    run_handler(
        handler.clone(),
        stream::iter(stream_buffer).map(Ok),
        event_tx.clone(),
    )
    .await;

    let stream_task = tokio::spawn(run_handler(handler, stream, event_tx));

    let ping_task = tokio::spawn({
        let session = session.clone();

        async move {
            loop {
                sleep(Duration::from_secs(60)).await;

                if session.send_ping().await.is_err() {
                    return;
                }
            }
        }
    });

    Ok(Client {
        session,
        event_rx,
        stream_task,
        ping_task,
    })
}
