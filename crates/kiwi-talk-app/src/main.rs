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

use tauri::{api::dialog, AppHandle, Manager, Runtime};

fn init_logger() {
    let mut builder = env_logger::Builder::from_default_env();

    #[cfg(not(debug_assertions))]
    builder.filter(None, log::LevelFilter::Info);

    builder.init();
}

async fn init_app(handle: &AppHandle<impl Runtime>) -> Result<(), Box<dyn Error + 'static>> {
    handle.plugin(
        system::init_plugin(
            handle.config().package.product_name.as_ref().unwrap(),
            "system",
        )
        .await?,
    )?;

    handle.plugin(auth::init_plugin("auth"))?;
    handle.plugin(app::init_plugin("app"))?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + 'static>> {
    init_logger();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let app = tauri::Builder::default().build(tauri::generate_context!())?;
    let main_window = app.get_window("main").unwrap();

    if let Err(err) = init_app(&app.handle()).await {
        dialog::message(
            Some(&main_window),
            "KiwiTalk Startup Fatal Error",
            format!("{}", err),
        );
    }

    app.run(|_, _| {});

    Ok(())
}
