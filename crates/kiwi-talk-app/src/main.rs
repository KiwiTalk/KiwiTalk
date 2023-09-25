#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod auth;
mod client;
mod configuration;
mod constants;
mod result;
mod system;

use tauri::{
    api::dialog, AppHandle, CustomMenuItem, Manager, Runtime, SystemTray, SystemTrayEvent,
    SystemTrayMenu,
};
use window_shadows::set_shadow;

fn init_logger() {
    let mut builder = env_logger::Builder::from_default_env();

    #[cfg(not(debug_assertions))]
    builder.filter(None, log::LevelFilter::Info);

    builder.init();
}

async fn init_app(handle: &AppHandle<impl Runtime>) -> anyhow::Result<()> {
    handle.plugin(tauri_plugin_window_state::Builder::default().build())?;

    handle.plugin(system::init_plugin("system", handle.path_resolver()).await?)?;
    handle.plugin(configuration::init_plugin("configuration").await?)?;
    handle.plugin(auth::init_plugin("auth"))?;
    handle.plugin(client::init_plugin("client"))?;

    Ok(())
}

fn on_tray_event(app: &AppHandle<impl Runtime>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let main_window = app.get_window("main").unwrap();

            if !main_window.is_visible().unwrap() {
                main_window.show().unwrap();
            }

            main_window.set_focus().unwrap();
        }

        SystemTrayEvent::MenuItemClick { id, .. } if id == "quit" => {
            app.exit(0);
        }

        _ => {}
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    init_logger();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let tray_menu = SystemTrayMenu::new().add_item(CustomMenuItem::new("quit", "Quit KiwiTalk"));
    let system_tray = SystemTray::new().with_menu(tray_menu);

    let app = tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(on_tray_event)
        .build(tauri::generate_context!())?;
    let main_window = app.get_window("main").unwrap();

    set_shadow(&main_window, true).ok();

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
