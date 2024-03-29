pub mod global;
pub mod locale;

use std::{
    fs::File,
    io::{BufReader, BufWriter},
    ops::Deref,
    path::{Path, PathBuf},
};

use anyhow::Context;
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use tokio::task::spawn_blocking;

use kiwi_talk_result::TauriResult;

use self::global::GlobalConfiguration;
use kiwi_talk_system::get_system_info;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[repr(transparent)]
pub struct ConfigPath(PathBuf);

impl Deref for ConfigPath {
    type Target = Path;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

type ConfigPathState<'a> = State<'a, ConfigPath>;

pub(super) async fn init_plugin<R: Runtime>(name: &'static str) -> anyhow::Result<TauriPlugin<R>> {
    let config_path: ConfigPath = ConfigPath(get_system_info().data_dir.join("configuration.json"));

    Ok(Builder::new(name)
        .setup(|handle| {
            handle.manage(config_path);

            Ok(())
        })
        .invoke_handler(generate_handler![load, save])
        .build())
}

#[tauri::command]
pub(super) async fn load(path: ConfigPathState<'_>) -> TauriResult<GlobalConfiguration> {
    let path = path.to_path_buf();

    Ok(spawn_blocking(move || {
        let reader = BufReader::new(File::open(path)?);

        let configuration = serde_json::from_reader::<_, GlobalConfiguration>(reader)?;

        Ok::<GlobalConfiguration, anyhow::Error>(configuration)
    })
    .await?
    .unwrap_or_default())
}

#[tauri::command]
pub(super) async fn save(
    configuration: GlobalConfiguration,
    path: ConfigPathState<'_>,
) -> TauriResult<()> {
    let path = path.to_path_buf();

    spawn_blocking(move || {
        let writer = BufWriter::new(File::create(path)?);

        serde_json::to_writer(writer, &configuration)?;

        Ok::<(), anyhow::Error>(())
    })
    .await?
    .context("cannot write configuration")?;

    Ok(())
}
