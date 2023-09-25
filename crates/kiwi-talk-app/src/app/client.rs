use std::task::Poll;

use anyhow::{anyhow, Context};
use futures::{future::poll_fn, stream, StreamExt};
use kiwi_talk_client::{
    config::ClientConfig, database::pool::DatabasePool, event::ClientEvent,
    handler::SessionHandler, ClientCredential, ClientStatus, KiwiTalkSession,
};
use parking_lot::RwLock;
use talk_loco_client::{session::LocoSession, LocoClient};
use tauri::{AppHandle, Manager, Runtime, State};
use tokio::{sync::mpsc, task::JoinHandle};

use crate::{result::TauriResult, system::SystemInfo};

use super::{conn::checkin, handler::run_handler, stream::create_secure_stream, Credential};
use crate::constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION};

type Client = RwLock<Option<ClientApp>>;

pub(super) fn setup(handle: &AppHandle<impl Runtime>) {
    handle.manage(Client::new(None));
}

pub struct ClientApp {
    session: KiwiTalkSession,
    event_rx: mpsc::Receiver<anyhow::Result<ClientEvent>>,
    stream_task: JoinHandle<()>,
}

impl Drop for ClientApp {
    fn drop(&mut self) {
        self.stream_task.abort();
    }
}

#[tauri::command(async)]
pub(super) async fn initialize_client(
    status: ClientStatus,
    credential: State<'_, Credential>,
    client: State<'_, Client>,
    info: State<'_, SystemInfo>,
) -> TauriResult<()> {
    let credential = credential
        .read()
        .clone()
        .ok_or_else(|| anyhow!("credential is not set"))?;

    let pool = DatabasePool::file("file:memdb?mode=memory&cache=shared")
        .context("failed to open database")?;
    pool.migrate_to_latest()
        .await
        .context("failed to migrate database to latest")?;

    let checkin = checkin(credential.user_id.unwrap_or(1)).await?;

    let (session, mut stream) = LocoSession::new(LocoClient::new(
        create_secure_stream((checkin.host.as_str(), checkin.port as u16))
            .await
            .context("failed to create secure stream")?,
    ));

    let mut stream_buffer = Vec::new();

    let session = {
        let login_task = async {
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
                ClientCredential {
                    access_token: &credential.access_token,
                    device_uuid: &info.device_info.device_uuid,
                    user_id: credential.user_id,
                },
                status,
            )
            .await
            .context("failed to login")
        };

        let stream_task = async {
            while let Some(read) = stream.next().await {
                let read = read?;

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
        stream::iter(stream_buffer).map(|command| Ok(command)),
        event_tx.clone(),
    )
    .await;

    let stream_task = tokio::spawn(run_handler(handler, stream, event_tx));

    *client.write() = Some(ClientApp {
        session,
        event_rx,
        stream_task,
    });

    Ok(())
}

#[tauri::command(async)]
pub(super) async fn next_client_event(
    client: State<'_, Client>,
) -> TauriResult<Option<ClientEvent>> {
    let event = poll_fn(|cx| {
        let mut client = client.write();

        let client = match &mut *client {
            Some(client) => client,
            None => return Poll::Ready(None),
        };

        client.event_rx.poll_recv(cx)
    })
    .await;

    Ok(match event {
        Some(res) => Some(res?),
        None => None,
    })
}

#[tauri::command(async)]
pub(super) async fn destroy_client(client: State<'_, Client>) -> Result<bool, ()> {
    Ok(client.write().take().is_some())
}

#[tauri::command]
pub(super) fn client_user_id(client: State<'_, Client>) -> Option<i64> {
    client.read().as_ref().map(|app| app.session.user_id())
}
