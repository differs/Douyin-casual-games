use axum::{
    Json,
    extract::{Json as JsonBody, State},
};

use crate::{
    dto::ad_reward::{AdRewardRequest, AdRewardResponse},
    error::AppError,
    extractors::auth::AuthUser,
    response::ApiResponse,
    services::ad_reward_service,
    state::AppState,
};

pub async fn claim_reward(
    State(state): State<AppState>,
    auth_user: AuthUser,
    JsonBody(payload): JsonBody<AdRewardRequest>,
) -> Result<Json<ApiResponse<AdRewardResponse>>, AppError> {
    let response = ad_reward_service::claim_reward(&state, auth_user.user_id, payload).await?;
    Ok(Json(ApiResponse::ok(response)))
}
