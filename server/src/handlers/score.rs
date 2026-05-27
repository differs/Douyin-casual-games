use axum::{
    Json,
    extract::{Json as JsonBody, State},
};

use crate::{
    dto::score::{SubmitScoreRequest, SubmitScoreResponse},
    error::AppError,
    extractors::auth::AuthUser,
    response::ApiResponse,
    services::score_service,
    state::AppState,
};

pub async fn submit_score(
    State(state): State<AppState>,
    auth_user: AuthUser,
    JsonBody(payload): JsonBody<SubmitScoreRequest>,
) -> Result<Json<ApiResponse<SubmitScoreResponse>>, AppError> {
    let response = score_service::submit_score(&state, auth_user.user_id, payload).await?;
    Ok(Json(ApiResponse::ok(response)))
}
