use axum::{Json, extract::State};

use crate::{
    dto::user::UserProfileResponse, error::AppError, extractors::auth::AuthUser,
    response::ApiResponse, services::user_service, state::AppState,
};

pub async fn profile(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<ApiResponse<UserProfileResponse>>, AppError> {
    let response = user_service::get_profile(&state, auth_user.user_id).await?;
    Ok(Json(ApiResponse::ok(response)))
}
