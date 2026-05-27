use axum::{Json, extract::State};
use chrono::Utc;
use serde::Serialize;

use crate::{response::ApiResponse, state::AppState};

#[derive(Serialize)]
pub struct HealthData {
    status: &'static str,
    env: String,
    database_enabled: bool,
    database_connected: bool,
    server_time: chrono::DateTime<Utc>,
}

pub async fn health(State(state): State<AppState>) -> Json<ApiResponse<HealthData>> {
    Json(ApiResponse::ok(HealthData {
        status: "ok",
        env: state.config.app_env.clone(),
        database_enabled: state.config.database_url.is_some(),
        database_connected: state.db.is_some(),
        server_time: Utc::now(),
    }))
}
