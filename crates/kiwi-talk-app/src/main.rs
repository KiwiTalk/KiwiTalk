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

fn init_logger() {
    let mut builder = env_logger::Builder::from_default_env();

    #[cfg(not(debug_assertions))]
    builder.filter(None, log::LevelFilter::Info);

    builder.init();
}

fn main() -> Result<(), Box<dyn Error + 'static>> {
    init_logger();

    let app = tauri::Builder::default()
        .plugin(system::init_plugin("system"))
        .plugin(auth::init_plugin("auth"))
        .plugin(app::init_plugin("app"))
        .build(tauri::generate_context!())?;

    app.run(|_, _| {});
    Ok(())
}
