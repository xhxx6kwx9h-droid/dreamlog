mod db;
mod models;
mod security;

use db::Database;
use models::{Dream, ListDreamsFilter};
use tauri::{State, Manager};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub db: Arc<Mutex<Database>>,
}

#[tauri::command]
async fn list_dreams(
    filters: ListDreamsFilter,
    state: State<'_, AppState>,
) -> Result<Vec<Dream>, String> {
    let db = state.db.lock().await;
    db.list_dreams(filters)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_dream(id: String, state: State<'_, AppState>) -> Result<Option<Dream>, String> {
    let db = state.db.lock().await;
    db.get_dream(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn upsert_dream(
    dream: Dream,
    state: State<'_, AppState>,
) -> Result<Dream, String> {
    let db = state.db.lock().await;
    db.upsert_dream(dream)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_dream(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().await;
    db.delete_dream(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn export_json(state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().await;
    db.export_json()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn import_json(
    json: String,
    state: State<'_, AppState>,
) -> Result<(usize, usize), String> {
    let db = state.db.lock().await;
    db.import_json(&json)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_app_paths(app: tauri::AppHandle) -> Result<std::collections::HashMap<String, String>, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let mut paths = std::collections::HashMap::new();
    paths.insert(
        "dbPath".to_string(),
        format!("sqlite:{}/dreamlog.db", app_dir.display()),
    );
    Ok(paths)
}

#[tauri::command]
fn hash_pin(pin: String) -> Result<String, String> {
    security::PinManager::hash_pin(&pin)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn verify_pin(pin: String, hash: String) -> Result<bool, String> {
    security::PinManager::verify_pin(&pin, &hash)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let _app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("failed to get app dir");
            std::fs::create_dir_all(&app_dir).expect("failed to create app dir");

            let db_path = format!("sqlite:{}/dreamlog.db", app_dir.display());

            let db = tokio::task::block_in_place(|| {
                tauri::async_runtime::block_on(async {
                    Database::new(&db_path).await.expect("failed to init db")
                })
            });

            app.manage(AppState {
                db: Arc::new(Mutex::new(db)),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_dreams,
            get_dream,
            upsert_dream,
            delete_dream,
            export_json,
            import_json,
            get_app_paths,
            hash_pin,
            verify_pin,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    tauri::async_runtime::block_on(run());
}
