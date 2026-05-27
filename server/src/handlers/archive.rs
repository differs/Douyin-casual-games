use axum::{
    Json,
    extract::{Json as JsonBody, State},
};

use crate::{
    dto::archive::{ArchiveResponse, SaveArchiveRequest, SaveArchiveResponse},
    error::AppError,
    extractors::auth::AuthUser,
    response::ApiResponse,
    services::archive_service,
    state::AppState,
};

pub async fn get_archive(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<ApiResponse<ArchiveResponse>>, AppError> {
    let archive = archive_service::get_archive(&state, auth_user.user_id).await?;
    Ok(Json(ApiResponse::ok(archive)))
}

pub async fn save_archive(
    State(state): State<AppState>,
    auth_user: AuthUser,
    JsonBody(payload): JsonBody<SaveArchiveRequest>,
) -> Result<Json<ApiResponse<SaveArchiveResponse>>, AppError> {
    archive_service::save_archive(&state, auth_user.user_id, payload).await?;
    Ok(Json(ApiResponse::ok(SaveArchiveResponse { saved: true })))
}
