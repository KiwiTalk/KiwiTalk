use std::{pin::Pin, task::Poll};

use anyhow::{anyhow, Context};
use futures::{future::poll_fn, AsyncRead, AsyncWrite, StreamExt};
use kiwi_talk_client::{
    config::ClientConfig, database::pool::DatabasePool, event::ClientEvent,
    handler::SessionHandler, ClientCredential, ClientStatus, KiwiTalkSession,
};
use parking_lot::RwLock;
use talk_loco_client::{
    session::{LocoSession, LocoSessionStream},
    LocoClient,
};
use tauri::{AppHandle, Manager, Runtime, State};

use crate::{result::TauriResult, system::SystemInfo};

use super::{conn::checkin, stream::create_secure_stream, Credential};
use crate::constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION};

type Client = RwLock<Option<ClientApp>>;

pub(super) fn setup(handle: &AppHandle<impl Runtime>) {
    handle.manage(Client::new(None));
}

trait AsyncStream: AsyncRead + AsyncWrite {}
impl<T: AsyncRead + AsyncWrite> AsyncStream for T {}

type BoxedLocoSessionStream = LocoSessionStream<Pin<Box<dyn AsyncStream + Send + Sync>>>;

pub struct ClientApp {
    session: KiwiTalkSession,
    stream: BoxedLocoSessionStream,
}

#[tauri::command(async)]
pub(super) async fn initialize_client(
    status: ClientStatus,
    credential: State<'_, Credential>,
    client: State<'_, Client>,
    info: State<'_, SystemInfo>,
) -> TauriResult<()> {
    let credential = match credential.read().clone() {
        Some(credential) => credential,
        None => Err(anyhow!("credential is not set"))?,
    };

    let pool = DatabasePool::file("file:memdb?mode=memory&cache=shared")
        .context("failed to open database")?;
    pool.migrate_to_latest()
        .await
        .context("failed to migrate database to latest")?;

    let checkin = checkin(credential.user_id.unwrap_or(1)).await?;

    let (session, stream) = LocoSession::new(LocoClient::new(Box::pin(
        create_secure_stream((checkin.host.as_str(), checkin.port as u16))
            .await
            .context("failed to create secure stream")?,
    ) as _));

    let session = KiwiTalkSession::login(
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
            device_uuid: info.device_info.device_uuid.as_str(),
            user_id: credential.user_id,
        },
        status,
    )
    .await
    .context("failed to login")?;

    *client.write() = Some(ClientApp { session, stream });

    Ok(())
}

#[tauri::command(async)]
pub(super) async fn next_client_event(
    client: State<'_, Client>,
) -> TauriResult<Option<ClientEvent>> {
    loop {
        let read = poll_fn(|cx| {
            let mut client = client.write();

            let client = match &mut *client {
                Some(client) => client,
                None => return Poll::Ready(None),
            };

            client.stream.poll_next_unpin(cx)
        })
        .await;
        let read = match read {
            Some(read) => read.context("error while reading from stream")?,
            None => return Ok(None),
        };

        let handler = {
            let client = client.read();
            let client = match &*client {
                Some(client) => client,
                None => return Ok(None),
            };

            SessionHandler::new(&client.session)
        };

        let event = handler
            .handle(&read)
            .await
            .context("error while handling read command")?;

        if let Some(event) = event {
            return Ok(Some(event));
        }
    }
}

#[tauri::command(async)]
pub(super) async fn destroy_client(client: State<'_, Client>) -> Result<bool, ()> {
    Ok(client.write().take().is_some())
}

#[tauri::command]
pub(super) fn client_user_id(client: State<'_, Client>) -> Option<i64> {
    client.read().as_ref().map(|app| app.session.user_id())
}
