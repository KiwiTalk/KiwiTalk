#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod auth;
mod error;

fn init_logger() {
    let mut builder = env_logger::Builder::from_default_env();

    #[cfg(not(debug_assertions))]
    builder.filter(None, log::LevelFilter::Info);

    builder.init();
}

#[tokio::main]
async fn main() {
    init_logger();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    tauri::Builder::default()
        .plugin(auth::init_plugin("auth"))
        .plugin(app::init_plugin("app"))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
