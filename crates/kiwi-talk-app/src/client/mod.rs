mod conn;
mod credential;
mod handler;

use parking_lot::RwLock;
use std::task::Poll;
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use anyhow::{anyhow, Context};
use futures::{future::poll_fn, stream, StreamExt};
use kiwi_talk_client::{
    config::ClientConfig, database::pool::DatabasePool, event::ClientEvent,
    handler::SessionHandler, ClientCredential, ClientStatus, KiwiTalkSession,
};
use talk_loco_client::futures_loco_protocol::{session::LocoSession, LocoClient};
use tokio::{sync::mpsc, task::JoinHandle};

use crate::{result::TauriResult, system::get_system_info};

use crate::constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION};
use conn::checkin;

use self::{conn::create_secure_stream, credential::CredentialState, handler::run_handler};

pub(super) fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .setup(|handle| {
            handle.manage::<RwLock<Option<ClientApp>>>(RwLock::new(None));

            credential::setup(handle);

            Ok(())
        })
        .invoke_handler(generate_handler![
            initialize,
            next_event,
            user_id,
            destroy,
            credential::set_credential,
        ])
        .build()
}

pub type ClientState<'a> = State<'a, RwLock<Option<ClientApp>>>;

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
async fn initialize(
    status: ClientStatus,
    credential: CredentialState<'_>,
    client: ClientState<'_>,
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
        stream::iter(stream_buffer).map(Ok),
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
async fn next_event(client: ClientState<'_>) -> TauriResult<Option<ClientEvent>> {
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
async fn destroy(client: ClientState<'_>) -> Result<bool, ()> {
    Ok(client.write().take().is_some())
}

#[tauri::command]
fn user_id(client: ClientState) -> Option<i64> {
    client.read().as_ref().map(|app| app.session.user_id())
}
