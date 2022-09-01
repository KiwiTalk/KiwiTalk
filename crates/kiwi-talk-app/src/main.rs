#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod auth;

use auth::init_auth_plugin;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(init_auth_plugin())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
