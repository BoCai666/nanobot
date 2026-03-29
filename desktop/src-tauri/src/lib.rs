// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WindowEvent,
};

mod sidecar;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 打印用户消息到控制台
#[tauri::command]
fn log_user_message(message: &str) {
    println!("\n┌─────────────────────────────────────┐");
    println!("│ 👤 用户消息                          │");
    println!("├─────────────────────────────────────┤");
    println!("│ {}", message);
    println!("└─────────────────────────────────────┘");
}

/// 打印 AI 回复到控制台
#[tauri::command]
fn log_ai_response(response: &str) {
    println!("\n┌─────────────────────────────────────┐");
    println!("│ 🤖 AI 回复                           │");
    println!("├─────────────────────────────────────┤");
    // 按行打印，处理长文本
    for line in response.lines() {
        println!("│ {}", line);
    }
    println!("└─────────────────────────────────────┘\n");
}

/// 打印流式 AI 回复片段
#[tauri::command]
fn log_ai_delta(delta: &str) {
    // 流式输出，不换行
    print!("{}", delta);
    // 确保立即输出
    use std::io::Write;
    std::io::stdout().flush().ok();
}

/// 打印流式回复开始
#[tauri::command]
fn log_ai_response_start() {
    println!("\n┌─────────────────────────────────────┐");
    println!("│ 🤖 AI 回复                           │");
    println!("├─────────────────────────────────────┤");
    print!("│ ");
}

/// 打印流式回复结束
#[tauri::command]
fn log_ai_response_end() {
    println!();
    println!("└─────────────────────────────────────┘\n");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize sidecar framework
    if let Err(e) = sidecar::init_sidecar() {
        eprintln!("Sidecar initialization warning: {}", e);
    }

    // Initialize sidecar state
    let sidecar_state = sidecar::init_sidecar_state();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(sidecar_state)
        .invoke_handler(tauri::generate_handler![
            greet,
            log_user_message,
            log_ai_response,
            log_ai_delta,
            log_ai_response_start,
            log_ai_response_end,
            sidecar::cmd_start_sidecar,
            sidecar::cmd_stop_sidecar,
            sidecar::cmd_get_sidecar_status
        ])
        .setup(|app| {
            // Auto-start sidecar on launch
            let app_handle = app.app_handle().clone();
            let state = app.state::<sidecar::SidecarStateHandle>().inner().clone();
            tauri::async_runtime::spawn(async move {
                println!("[nanobot] Auto-starting sidecar...");
                match sidecar::start_sidecar(&app_handle, state).await {
                    Ok(port) => {
                        println!("[nanobot] Sidecar started on port {}", port);
                    }
                    Err(e) => {
                        eprintln!("[nanobot] Failed to auto-start sidecar: {}", e);
                    }
                }
            });

            // 创建托盘菜单项
            let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
            let restart_gateway_i =
                MenuItem::with_id(app, "restart_gateway", "重启 Gateway", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

            // 创建托盘菜单
            let menu = Menu::with_items(
                app,
                &[&show_i, &hide_i, &restart_gateway_i, &quit_i],
            )?;

            // 创建托盘图标
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("nanobot Desktop")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app: &AppHandle, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "restart_gateway" => {
                        // Stop then start the sidecar
                        let app_handle = app.clone();
                        let state = app.state::<sidecar::SidecarStateHandle>().inner().clone();
                        tauri::async_runtime::spawn(async move {
                            println!("[nanobot] Restarting sidecar...");
                            let _ = sidecar::stop_sidecar(state.clone(), None).await;
                            // Small delay before restart
                            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                            match sidecar::start_sidecar(&app_handle, state).await {
                                Ok(port) => {
                                    println!("[nanobot] Sidecar restarted on port {}", port);
                                }
                                Err(e) => {
                                    eprintln!("[nanobot] Failed to restart sidecar: {}", e);
                                }
                            }
                        });
                    }
                    "quit" => {
                        // Stop sidecar before quitting
                        let state = app.state::<sidecar::SidecarStateHandle>().inner().clone();
                        let app_handle = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let _ = sidecar::stop_sidecar(state, None).await;
                            app_handle.exit(0);
                        });
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // 设置窗口关闭行为为隐藏而非退出
            let window = app.get_webview_window("main").unwrap();
            let app_handle: AppHandle = app.app_handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    // 阻止默认关闭行为
                    api.prevent_close();
                    // 隐藏窗口
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
