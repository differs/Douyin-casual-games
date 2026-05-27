use axum::{
    Json,
    extract::{Json as JsonBody, State},
};

use crate::{
    dto::analytics::{EventReportRequest, EventReportResponse},
    error::AppError,
    extractors::auth::AuthUser,
    response::ApiResponse,
    services::analytics_service,
    state::AppState,
};

pub async fn report_events(
    State(state): State<AppState>,
    auth_user: AuthUser,
    JsonBody(payload): JsonBody<EventReportRequest>,
) -> Result<Json<ApiResponse<EventReportResponse>>, AppError> {
    let response = analytics_service::report_events(&state, auth_user.user_id, payload).await?;
    Ok(Json(ApiResponse::ok(response)))
}
