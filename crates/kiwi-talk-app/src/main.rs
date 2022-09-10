#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod auth;
mod constants;
mod device;
mod error;

use std::{error::Error, path::PathBuf};

use constants::{
    APP_DEVICE_UUID_FILE, APP_PORTABLE_DATA_DIR, DEFAULT_DEVICE_LOCALE, DEFAULT_DEVICE_NAME,
};
use device::{gen_device_uuid, get_device_locale, get_device_name, DeviceInfo};
use platform_dirs::AppDirs;
use tauri::{App, Manager};
use tokio::fs;

#[derive(Debug)]
pub struct KiwiTalkSystemInfo {
    pub device_data_dir: PathBuf,
    pub data_dir: PathBuf,
    pub device_info: DeviceInfo,
}

// TODO:: cleanup code
async fn setup_app(app: &mut App) -> Result<(), Box<dyn Error + 'static>> {
    let device_data_dir = if let Some(app_dirs) = AppDirs::new(
        Some(app.config().package.product_name.as_ref().unwrap()),
        false,
    ) {
        app_dirs.data_dir
    } else {
        return Err("Cannot find device local data directory".into());
    };

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
            fs::read_to_string(&path).await?
        } else {
            let uuid = gen_device_uuid();
            fs::write(&path, &uuid).await?;
            uuid
        }
    };

    let device_info = DeviceInfo {
        locale: get_device_locale().unwrap_or_else(|| String::from(DEFAULT_DEVICE_LOCALE)),
        name: get_device_name().unwrap_or_else(|| String::from(DEFAULT_DEVICE_NAME)),
        device_uuid,
    };

    app.manage(KiwiTalkSystemInfo {
        device_data_dir,
        data_dir,
        device_info,
    });

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + 'static>> {
    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let mut app = tauri::Builder::default()
        .plugin(auth::init_plugin("auth"))
        .plugin(app::init_plugin("app"))
        .build(tauri::generate_context!())?;

    setup_app(&mut app).await?;

    app.run(|_, _| {});
    Ok(())
}
