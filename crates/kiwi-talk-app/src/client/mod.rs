mod conn;
mod handler;
mod saved_account;

use enum_kinds::EnumKind;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::task::Poll;
use talk_api_client::auth::{AccountLoginForm, LoginMethod, TokenLoginForm};
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use anyhow::{anyhow, Context};
use futures::{future::poll_fn, stream, StreamExt};
use kiwi_talk_client::{
    config::ClientConfig, database::pool::DatabasePool, event::ClientEvent,
    handler::SessionHandler, ClientCredential, ClientStatus, KiwiTalkSession,
};
use talk_loco_client::futures_loco_protocol::{session::LocoSession, LocoClient};
use tokio::{sync::mpsc, task::JoinHandle};

use crate::{
    auth::{create_auth_client, create_auto_login_token},
    result::TauriResult,
    system::get_system_info,
};

use crate::constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION};
use conn::checkin;

use self::{conn::create_secure_stream, handler::run_handler, saved_account::SavedAccount};

pub(super) async fn init_plugin<R: Runtime>(name: &'static str) -> anyhow::Result<TauriPlugin<R>> {
    let state = if let Some(SavedAccount {
        email,
        token: Some(token),
    }) = saved_account::read().await.unwrap_or_default()
    {
        try_auto_login(&email, &hex::encode(token), false, ClientStatus::Unlocked)
            .await
            .map_or_else(
                |err| {
                    println!("cannot login: {:?}", err);
                    State::NeedLogin
                },
                State::Logon,
            )
    } else {
        State::NeedLogin
    };

    Ok(Builder::new(name)
        .setup(move |handle| {
            handle.manage::<RwLock<State>>(RwLock::new(state));

            Ok(())
        })
        .invoke_handler(generate_handler![
            get_state,
            default_login_form,
            login,
            logout,
            next_event,
            user_id
        ])
        .build())
}

type ClientState<'a> = tauri::State<'a, RwLock<State>>;

#[tauri::command]
fn get_state(state: ClientState) -> StateKind {
    StateKind::from(&*state.read())
}

#[tauri::command(async)]
async fn default_login_form() -> Result<LoginForm, ()> {
    Ok(saved_account::read()
        .await
        .map(|data| match data {
            Some(data) => LoginForm {
                email: data.email,
                password: String::new(),
                save_email: true,
                auto_login: data.token.is_some(),
            },

            None => Default::default(),
        })
        .unwrap_or_default())
}

#[tauri::command(async)]
async fn login(
    form: LoginForm,
    forced: bool,
    status: ClientStatus,
    state: ClientState<'_>,
) -> TauriResult<i32> {
    if let State::Logon(_) = &*state.read() {
        return Err(anyhow!("already logon").into());
    }

    let login_data = {
        let res = create_auth_client()
            .login(
                LoginMethod::Account(AccountLoginForm {
                    email: &form.email,
                    password: &form.password,
                }),
                forced,
            )
            .await?;

        if res.status == 0 {
            res.data
                .ok_or_else(|| anyhow!("cannot deserialize login data"))?
        } else {
            return Ok(res.status);
        }
    };

    let device_uuid = &get_system_info().device_info.device_uuid;

    let _ = saved_account::write(if form.save_email {
        let token = if form.auto_login {
            Some(create_auto_login_token(
                &login_data.auto_login_account_id,
                &login_data.credential.refresh_token,
                device_uuid,
            ))
        } else {
            None
        };

        Some(SavedAccount {
            email: login_data.auto_login_account_id,
            token,
        })
    } else {
        None
    })
    .await;

    let client = create_client(
        status,
        ClientCredential {
            access_token: &login_data.credential.access_token,
            device_uuid,
            user_id: Some(login_data.user_id as i64),
        },
    )
    .await
    .context("cannot create client")?;

    *state.write() = State::Logon(client);

    Ok(0)
}

#[tauri::command]
fn logout(state: ClientState<'_>) -> TauriResult<()> {
    match &mut *state.write() {
        state @ State::Logon(_) => {
            *state = State::NeedLogin;

            Ok(())
        }

        _ => Err(anyhow!("already logout").into()),
    }
}

#[tauri::command(async)]
async fn next_event(client: ClientState<'_>) -> TauriResult<Option<ClientEvent>> {
    let event = poll_fn(|cx| {
        let mut client = client.write();

        let client = match &mut *client {
            State::Logon(client) => client,
            _ => return Poll::Ready(None),
        };

        client.event_rx.poll_recv(cx)
    })
    .await;

    Ok(match event {
        Some(res) => Some(res?),
        None => None,
    })
}

#[tauri::command]
fn user_id(client: ClientState) -> TauriResult<i64> {
    match &*client.read() {
        State::Logon(client) => Ok(client.session.user_id()),

        _ => Err(anyhow!("not logon").into()),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginForm {
    email: String,
    password: String,
    save_email: bool,
    auto_login: bool,
}

impl Default for LoginForm {
    fn default() -> Self {
        Self {
            email: Default::default(),
            password: Default::default(),
            save_email: true,
            auto_login: false,
        }
    }
}

#[derive(Debug, EnumKind)]
#[enum_kind(StateKind, derive(Serialize, Deserialize))]
pub enum State {
    NeedLogin,
    Logon(Client),
}

#[derive(Debug)]
pub struct Client {
    session: KiwiTalkSession,
    event_rx: mpsc::Receiver<anyhow::Result<ClientEvent>>,
    stream_task: JoinHandle<()>,
}

impl Drop for Client {
    fn drop(&mut self) {
        self.stream_task.abort();
    }
}

async fn try_auto_login(
    email: &str,
    token: &str,
    forced: bool,
    status: ClientStatus,
) -> anyhow::Result<Client> {
    let login_data = {
        let res = create_auth_client()
            .login(
                LoginMethod::Token(TokenLoginForm {
                    email,
                    auto_login_token: token,
                    locked: status == ClientStatus::Locked,
                }),
                forced,
            )
            .await?;

        if res.status == 0 {
            res.data
                .ok_or_else(|| anyhow!("cannot deserialize login data"))?
        } else {
            return Err(anyhow!(
                "cannot login account using given token. status: {}",
                res.status
            ));
        }
    };

    let device_uuid = &get_system_info().device_info.device_uuid;

    create_client(
        status,
        ClientCredential {
            access_token: &login_data.credential.access_token,
            device_uuid,
            user_id: Some(login_data.user_id as i64),
        },
    )
    .await
}

async fn create_client(
    status: ClientStatus,
    credential: ClientCredential<'_>,
) -> anyhow::Result<Client> {
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
                credential,
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

    Ok(Client {
        session,
        event_rx,
        stream_task,
    })
}
