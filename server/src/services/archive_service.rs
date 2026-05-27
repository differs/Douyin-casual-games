use crate::{
    dto::archive::{ArchiveResponse, DailyArchive, SaveArchiveRequest},
    error::AppError,
    repositories::archive_repo,
    state::AppState,
};

pub async fn get_archive(state: &AppState, user_id: i64) -> Result<ArchiveResponse, AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;
    let archive = archive_repo::find_by_user_id(pool, user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    Ok(ArchiveResponse {
        best_score: archive.best_score,
        coin: archive.coin,
        current_skin_id: archive.current_skin_id,
        owned_skin_ids: archive.owned_skin_ids.0,
        audio_enabled: archive.audio_enabled,
        daily: DailyArchive {
            revive_used: archive.revive_used_today,
            ad_reward_claimed: archive.ad_reward_claimed_today,
        },
    })
}

pub async fn save_archive(
    state: &AppState,
    user_id: i64,
    payload: SaveArchiveRequest,
) -> Result<(), AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;

    if let Some(skin_id) = payload.current_skin_id.as_deref() {
        if skin_id.trim().is_empty() {
            return Err(AppError::InvalidParams("current_skin_id_empty"));
        }
    }

    archive_repo::update_settings(
        pool,
        user_id,
        payload.current_skin_id.as_deref(),
        payload.audio_enabled,
    )
    .await
}
