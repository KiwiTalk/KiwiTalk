#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod auth;
mod constants;
mod error;
mod system;

use std::error::Error;

use system::init_system_info;
use tauri::{App, Manager};

async fn setup_app(app: &mut App) -> Result<(), Box<dyn Error + 'static>> {
    app.manage(init_system_info(app.config().package.product_name.as_ref().unwrap()).await?);

    Ok(())
}

fn init_logger() {
    let mut builder = env_logger::Builder::from_default_env();

    #[cfg(not(debug_assertions))]
    builder.filter(None, log::LevelFilter::Info);

    builder.init();
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + 'static>> {
    init_logger();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let mut app = tauri::Builder::default()
        .plugin(auth::init_plugin("auth"))
        .plugin(app::init_plugin("app"))
        .build(tauri::generate_context!())?;

    setup_app(&mut app).await?;

    app.run(|_, _| {});
    Ok(())
}
