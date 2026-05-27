use axum::{
    Json,
    extract::{Json as JsonBody, State},
};

use crate::{
    dto::auth::{LoginRequest, LoginResponse},
    error::AppError,
    response::ApiResponse,
    services::auth_service,
    state::AppState,
};

pub async fn login(
    State(state): State<AppState>,
    JsonBody(payload): JsonBody<LoginRequest>,
) -> Result<Json<ApiResponse<LoginResponse>>, AppError> {
    let response = auth_service::login(&state, payload).await?;
    Ok(Json(ApiResponse::ok(response)))
}
