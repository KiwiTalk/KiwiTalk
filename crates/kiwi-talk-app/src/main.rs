#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod auth;
mod constants;

#[tokio::main]
async fn main() {
    tauri::async_runtime::set(tokio::runtime::Handle::current());

    tauri::Builder::default()
        .plugin(auth::init_plugin("auth"))
        .plugin(app::init_plugin("app"))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
