use std::path::PathBuf;

use base64::{engine::general_purpose::STANDARD, Engine};
use platform_dirs::AppDirs;
use rand::Rng;
use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use thiserror::Error;
use tokio::{
    fs::{self, File},
    io::{self, AsyncReadExt},
};

use crate::constants::{
    APP_DEVICE_UUID_FILE, APP_PORTABLE_DATA_DIR, DEFAULT_DEVICE_LOCALE, DEFAULT_DEVICE_NAME,
};

pub async fn init_plugin<R: Runtime>(
    app_name: &str,
    name: &'static str,
) -> tauri::plugin::Result<TauriPlugin<R>> {
    let info = init_system_info(app_name).await?;

    Ok(Builder::new(name)
        .setup(|handle| {
            handle.manage(info);
            Ok(())
        })
        .invoke_handler(generate_handler![get_device_locale, get_device_name])
        .build())
}

#[tauri::command]
fn get_device_locale(info: State<'_, SystemInfo>) -> String {
    info.device_info.locale.clone()
}

#[tauri::command]
fn get_device_name(info: State<'_, SystemInfo>) -> String {
    info.device_info.name.clone()
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

    #[inline]
    pub fn as_str(&self) -> &str {
        self.0.as_str()
    }

    pub fn decode(&self) -> Vec<u8> {
        STANDARD.decode(&self.0).unwrap()
    }
}

impl AsRef<str> for DeviceUuid {
    fn as_ref(&self) -> &str {
        self.as_str()
    }
}

pub fn gen_device_uuid() -> DeviceUuid {
    let mut rng = rand::thread_rng();

    let mut random_bytes = [0_u8; 64];
    rng.fill(&mut random_bytes);

    DeviceUuid::new(&random_bytes)
}

pub async fn init_system_info(app_name: &str) -> Result<SystemInfo, SystemInitError> {
    let device_data_dir = AppDirs::new(Some(app_name), false)
        .ok_or(SystemInitError::DeviceDataDirectoryNotFound)?
        .data_dir;

    let data_dir = if fs::metadata(APP_PORTABLE_DATA_DIR)
        .await
        .map(|metadata| metadata.is_dir())
        .unwrap_or(false)
    {
        APP_PORTABLE_DATA_DIR.into()
    } else {
        device_data_dir.clone()
    };

    let device_uuid = {
        let path = device_data_dir.as_path().join(APP_DEVICE_UUID_FILE);
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
        }
    };

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

#[derive(Debug, Error)]
pub enum SystemInitError {
    #[error("Device local data directory is not found")]
    DeviceDataDirectoryNotFound,

    #[error(transparent)]
    Io(#[from] io::Error),
}
