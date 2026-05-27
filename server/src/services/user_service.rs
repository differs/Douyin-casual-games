use crate::{
    dto::user::UserProfileResponse,
    error::AppError,
    repositories::{archive_repo, user_repo},
    state::AppState,
};

pub async fn get_profile(state: &AppState, user_id: i64) -> Result<UserProfileResponse, AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;

    let user = user_repo::find_by_id(pool, user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;
    let archive = archive_repo::find_by_user_id(pool, user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    Ok(UserProfileResponse {
        user_id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        coin: archive.coin,
        best_score: archive.best_score,
        current_skin_id: archive.current_skin_id,
        audio_enabled: archive.audio_enabled,
    })
}
