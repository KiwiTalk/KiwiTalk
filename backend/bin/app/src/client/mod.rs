mod channel_list;
mod conn;
mod event;
mod handler;
mod saved_account;

use enum_kinds::EnumKind;
use kiwi_talk_auth::{create_auth_client, create_auto_login_token};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{task::Poll, time::Duration};
use talk_api_client::auth::{AccountLoginForm, LoginMethod, TokenLoginForm};
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
use tokio::{sync::mpsc, task::JoinHandle, time::interval};

use kiwi_talk_result::{TauriAnyhowError, TauriResult};
use kiwi_talk_system::get_system_info;

use crate::constants::{TALK_DEVICE_TYPE, TALK_MCCMNC, TALK_NET_TYPE, TALK_OS, TALK_VERSION};
use conn::checkin;

use self::{
    conn::create_secure_stream, event::MainEvent, handler::run_handler, saved_account::SavedAccount,
};

pub(super) async fn init_plugin<R: Runtime>(name: &'static str) -> anyhow::Result<TauriPlugin<R>> {
    let state = try_auto_login(false, ClientStatus::Unlocked)
        .await
        .map_or_else(
            |err| State::NeedLogin {
                reason: Some(Reason::AutoLoginFailed(err)),
            },
            |opt| match opt {
                Some((client, email)) => State::Logon { client, email },
                None => State::NeedLogin { reason: None },
            },
        );

    Ok(Builder::new(name)
        .setup(move |handle| {
            handle.manage::<RwLock<State>>(RwLock::new(state));

            Ok(())
        })
        .invoke_handler(generate_handler![
            get_state,
            take_login_reason,
            default_login_form,
            login,
            logout,
            next_main_event,
            user_email,
            channel_list::channel_list,
        ])
        .build())
}

type ClientState<'a> = tauri::State<'a, RwLock<State>>;

#[tauri::command]
fn get_state(state: ClientState) -> StateKind {
    StateKind::from(&*state.read())
}

#[tauri::command]
fn take_login_reason(state: ClientState) -> TauriResult<Option<Reason>> {
    match &mut *state.write() {
        State::NeedLogin { reason } => Ok(reason.take()),

        _ => Err(anyhow!("client already logon").into()),
    }
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
    if let State::Logon { .. } = &*state.read() {
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
            email: login_data.auto_login_account_id.clone(),
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
        },
        login_data.user_id as _,
    )
    .await
    .context("cannot create client")?;

    *state.write() = State::Logon {
        client,
        email: login_data.auto_login_account_id,
    };

    Ok(0)
}

#[tauri::command]
fn logout(state: ClientState<'_>) -> TauriResult<()> {
    match &mut *state.write() {
        state @ State::Logon { .. } => {
            *state = State::NeedLogin { reason: None };

            Ok(())
        }

        _ => Err(anyhow!("already logout").into()),
    }
}

#[tauri::command(async)]
async fn next_main_event(state: ClientState<'_>) -> TauriResult<Option<MainEvent>> {
    Ok(poll_fn(|cx| {
        let mut state = state.write();

        let client = match &mut *state {
            State::Logon { client, .. } => client,
            _ => return Poll::Ready(None),
        };

        let read = ready!(client.event_rx.poll_recv(cx));

        if let Some(Ok(MainEvent::Kickout { reason })) = &read {
            *state = State::NeedLogin {
                reason: Some(Reason::Kickout(*reason)),
            };
        } else if read.is_none() {
            *state = State::NeedLogin { reason: None };
        }

        Poll::Ready(read)
    })
    .await
    .transpose()?)
}

#[tauri::command]
fn user_email(client: ClientState) -> TauriResult<String> {
    match &*client.read() {
        State::Logon { email, .. } => Ok(email.clone()),

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
enum State {
    NeedLogin { reason: Option<Reason> },
    Logon { client: Client, email: String },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content")]
enum Reason {
    AutoLoginFailed(AutoLoginError),
    Kickout(i16),
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content")]
enum AutoLoginError {
    InvalidFile,
    Status(i32),
    Other(TauriAnyhowError),
}

impl<T: Into<TauriAnyhowError>> From<T> for AutoLoginError {
    fn from(value: T) -> Self {
        Self::Other(value.into())
    }
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

async fn try_auto_login(
    forced: bool,
    status: ClientStatus,
) -> Result<Option<(Client, String)>, AutoLoginError> {
    let (email, token) = if let Some(SavedAccount {
        email,
        token: Some(token),
    }) = saved_account::read()
        .await
        .map_err(|_| AutoLoginError::InvalidFile)?
    {
        (email, token)
    } else {
        return Ok(None);
    };

    let login_data = {
        let res = create_auth_client()
            .login(
                LoginMethod::Token(TokenLoginForm {
                    email: &email,
                    auto_login_token: &hex::encode(token),
                    locked: status == ClientStatus::Locked,
                }),
                forced,
            )
            .await?;

        if res.status == 0 {
            res.data.ok_or_else(|| AutoLoginError::InvalidFile)?
        } else {
            return Err(AutoLoginError::Status(res.status));
        }
    };

    let device_uuid = &get_system_info().device_info.device_uuid;

    let _ = {
        let token = create_auto_login_token(
            &login_data.auto_login_account_id,
            &login_data.credential.refresh_token,
            device_uuid,
        );

        saved_account::write(Some(SavedAccount {
            email: login_data.auto_login_account_id.clone(),
            token: Some(token),
        }))
        .await
    };

    Ok(Some((
        create_client(
            status,
            ClientCredential {
                access_token: &login_data.credential.access_token,
                device_uuid,
            },
            login_data.user_id as i64,
        )
        .await?,
        login_data.auto_login_account_id,
    )))
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
            let mut timer = interval(Duration::from_secs(60));

            loop {
                timer.tick().await;

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
