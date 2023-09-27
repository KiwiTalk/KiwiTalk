use std::{
    fs::File,
    io::{BufReader, BufWriter},
    path::PathBuf,
};

use anyhow::Context;
use serde::{Deserialize, Serialize};
use tauri::{
    command, generate_handler,
    plugin::{Builder, TauriPlugin},
    Runtime,
};
use tokio::task::spawn_blocking;

use crate::{result::TauriResult, system::get_system_info};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
struct LoginData {
    email: String,
    token: Option<String>,
}

pub(super) fn init_plugin<R: Runtime>(name: &'static str) -> TauriPlugin<R> {
    Builder::new(name)
        .invoke_handler(generate_handler![load, save])
        .build()
}

fn file_path() -> PathBuf {
    get_system_info().config_dir.join("login_data")
}

#[command(async)]
async fn load() -> TauriResult<Option<LoginData>> {
    Ok(spawn_blocking(move || -> anyhow::Result<_> {
        let reader = BufReader::new(File::open(file_path())?);

        Ok(bincode::deserialize_from(reader)?)
    })
    .await?
    .unwrap_or_default())
}

#[command(async)]
async fn save(data: LoginData) -> TauriResult<()> {
    Ok(spawn_blocking(move || -> anyhow::Result<_> {
        let writer = BufWriter::new(File::create(file_path())?);

        bincode::serialize_into(writer, &data)?;

        Ok(())
    })
    .await?
    .context("cannot save login data")?)
}
