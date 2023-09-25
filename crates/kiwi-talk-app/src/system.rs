use std::{
    ops::Deref,
    path::{Path, PathBuf},
    sync::OnceLock,
};

use anyhow::Context;
use base64::{engine::general_purpose::STANDARD, Engine};
use rand::Rng;
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    PathResolver, Runtime,
};
use tokio::{
    fs::{self, File},
    io::AsyncReadExt,
};

use crate::constants::{
    APP_DEVICE_UUID_FILE, APP_PORTABLE_DATA_DIR, DEFAULT_DEVICE_LOCALE, DEFAULT_DEVICE_NAME,
};

static SYSTEM: OnceLock<SystemInfo> = OnceLock::new();

pub fn get_system_info() -> &'static SystemInfo {
    SYSTEM.get().unwrap()
}

pub(super) async fn init_plugin<R: Runtime>(
    name: &'static str,
    path_resolver: PathResolver,
) -> tauri::plugin::Result<TauriPlugin<R>> {
    SYSTEM
        .set(
            create_system_info(
                path_resolver
                    .app_data_dir()
                    .context("cannot find device data directory")?,
            )
            .await?,
        )
        .expect("Cannot initialize System information");

    Ok(Builder::new(name)
        .invoke_handler(generate_handler![get_device_locale, get_device_name])
        .build())
}

#[tauri::command]
fn get_device_locale() -> String {
    get_system_info().device_info.locale.clone()
}

#[tauri::command]
fn get_device_name() -> String {
    get_system_info().device_info.name.clone()
}

#[derive(Debug)]
pub struct SystemInfo {
    pub device_data_dir: PathBuf,
    pub data_dir: PathBuf,
    pub device_info: DeviceInfo,
}

#[derive(Debug)]
pub struct DeviceInfo {
    pub locale: String,
    pub name: String,
    pub device_uuid: DeviceUuid,
}

impl DeviceInfo {
    #[inline]
    pub fn language(&self) -> &str {
        &self.locale[..2]
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceUuid(String);

impl DeviceUuid {
    pub fn new(data: &[u8; 64]) -> Self {
        DeviceUuid(STANDARD.encode(data))
    }

    pub fn decode(&self) -> Vec<u8> {
        STANDARD.decode(&self.0).unwrap()
    }
}

impl Deref for DeviceUuid {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

fn gen_device_uuid() -> DeviceUuid {
    let mut rng = rand::thread_rng();

    let mut random_bytes = [0_u8; 64];
    rng.fill(&mut random_bytes);

    DeviceUuid::new(&random_bytes)
}

async fn create_system_info(device_data_dir: PathBuf) -> anyhow::Result<SystemInfo> {
    let data_dir = if fs::metadata(APP_PORTABLE_DATA_DIR)
        .await
        .map(|metadata| metadata.is_dir())
        .unwrap_or(false)
    {
        APP_PORTABLE_DATA_DIR.into()
    } else {
        device_data_dir.clone()
    };

    let device_uuid = init_device_uuid(&device_data_dir)
        .await
        .context("cannot initialize device uuid")?;

    let locale = sys_locale::get_locale().unwrap_or_else(|| String::from(DEFAULT_DEVICE_LOCALE));
    let name = hostname::get()
        .map(|hostname| hostname.into_string().ok())
        .ok()
        .flatten()
        .unwrap_or_else(|| String::from(DEFAULT_DEVICE_NAME));

    let device_info = DeviceInfo {
        locale,
        name,
        device_uuid,
    };

    Ok(SystemInfo {
        device_data_dir,
        data_dir,
        device_info,
    })
}

async fn init_device_uuid(device_data_dir: &Path) -> anyhow::Result<DeviceUuid> {
    let path = device_data_dir.join(APP_DEVICE_UUID_FILE);

    Ok(
        if fs::metadata(&path)
            .await
            .map(|metadata| metadata.is_file())
            .unwrap_or(false)
        {
            let mut file = File::open(&path).await?;

            let mut buf = [0; 64];
            file.read_exact(&mut buf).await?;

            DeviceUuid::new(&buf)
        } else {
            let uuid = gen_device_uuid();
            fs::create_dir_all(path.parent().unwrap()).await?;
            fs::write(&path, uuid.decode()).await?;

            uuid
        },
    )
}
