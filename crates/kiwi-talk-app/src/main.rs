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
    api::dialog, AppHandle, CustomMenuItem, DeviceEventFilter, Manager, RunEvent, Runtime,
    SystemTray, SystemTrayEvent, SystemTrayMenu, Window, WindowBuilder, WindowEvent,
};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};
use window_shadows::set_shadow;

fn init_logger() {
    let mut builder = env_logger::Builder::from_default_env();

    #[cfg(not(debug_assertions))]
    builder.filter(None, log::LevelFilter::Info);

    builder.init();
}

fn create_main_window<R: Runtime>(manager: &impl Manager<R>) -> anyhow::Result<Window<R>> {
    let window = WindowBuilder::new(manager, "main", tauri::WindowUrl::App("index.html".into()))
        .inner_size(1280.0, 720.0)
        .resizable(true)
        .title("KiwiTalk")
        .decorations(false)
        .visible(false)
        .build()?;

    Ok(window)
}

async fn init_plugin(handle: &AppHandle<impl Runtime>) -> anyhow::Result<()> {
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
            if app.get_window("main").is_some() {
                return;
            }

            let main_window = create_main_window(app).unwrap();
            main_window.show().unwrap();

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
        .device_event_filter(DeviceEventFilter::Never)
        .on_system_tray_event(on_tray_event)
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { .. } = event.event() {
                event
                    .window()
                    .app_handle()
                    .save_window_state(StateFlags::all())
                    .unwrap();
            }
        })
        .build(tauri::generate_context!())?;

    let main_window = create_main_window(&app)?;
    set_shadow(&main_window, true).ok();
    main_window.show()?;

    if let Err(err) = init_plugin(&app.handle()).await {
        dialog::message(
            Some(&main_window),
            "KiwiTalk Startup Fatal Error",
            format!("{:?}", err),
        );
    }

    app.run(|_, event| {
        if let RunEvent::ExitRequested { api, .. } = event {
            api.prevent_exit();
        }
    });

    Ok(())
}
