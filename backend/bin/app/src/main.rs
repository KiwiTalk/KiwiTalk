#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod configuration;

use kiwi_talk_system::get_system_info;
use tauri::{
    api::dialog, AppHandle, CustomMenuItem, DeviceEventFilter, Manager, RunEvent, Runtime,
    SystemTray, SystemTrayEvent, SystemTrayMenu, Window, WindowBuilder,
};
use tauri_plugin_log::LogTarget;
use tauri_plugin_window_state::{StateFlags, WindowExt};
use window_shadows::set_shadow;

fn create_main_window<R: Runtime>(manager: &impl Manager<R>) -> anyhow::Result<Window<R>> {
    let window = WindowBuilder::new(manager, "main", tauri::WindowUrl::App("index.html".into()))
        .inner_size(1280.0, 720.0)
        .resizable(true)
        .title("KiwiTalk")
        .decorations(false)
        .visible(false)
        .build()?;

    set_shadow(&window, true).ok();
    window.restore_state(StateFlags::all())?;

    Ok(window)
}

async fn init_plugin(handle: &AppHandle<impl Runtime>) -> anyhow::Result<()> {
    handle.plugin(kiwi_talk_system::init(handle.path_resolver()).await?)?;

    handle.plugin(
        tauri_plugin_log::Builder::new()
            .targets([
                LogTarget::Folder(get_system_info().data_dir.join("logs")),
                LogTarget::Stderr,
                LogTarget::Webview,
            ])
            .level(
                #[cfg(not(debug_assertions))]
                log::LevelFilter::Info,
                #[cfg(debug_assertions)]
                log::LevelFilter::Trace,
            )
            .build(),
    )?;
    handle.plugin(tauri_plugin_window_state::Builder::default().build())?;

    handle.plugin(kiwi_talk_api::init().await)?;
    handle.plugin(configuration::init_plugin("configuration").await?)?;
    handle.plugin(kiwi_talk_client::init_plugin("client").await?)?;

    Ok(())
}

fn on_tray_event(app: &AppHandle<impl Runtime>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let main_window = if let Some(window) = app.get_window("main") {
                window
            } else {
                let window = create_main_window(app).unwrap();
                window.restore_state(StateFlags::all()).unwrap();
                window.show().unwrap();

                window
            };

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
    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let tray_menu = SystemTrayMenu::new().add_item(CustomMenuItem::new("quit", "Quit KiwiTalk"));
    let system_tray = SystemTray::new().with_menu(tray_menu);

    let app = tauri::Builder::default()
        .system_tray(system_tray)
        .device_event_filter(DeviceEventFilter::Never)
        .on_system_tray_event(on_tray_event)
        .build(tauri::generate_context!())?;

    if let Err(err) = init_plugin(&app.handle()).await {
        dialog::message::<tauri::Wry>(None, "KiwiTalk Startup Fatal Error", format!("{:?}", err));
        app.run(|_, _| {});

        return Ok(());
    }

    let main_window = create_main_window(&app)?;
    main_window.show()?;

    #[cfg(debug_assertions)]
    {
        main_window.open_devtools();
    }

    app.run(|_, event| {
        if let RunEvent::ExitRequested { api, .. } = event {
            api.prevent_exit();
        }
    });

    Ok(())
}
