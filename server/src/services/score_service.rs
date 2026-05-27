use crate::{
    dto::score::{SubmitScoreRequest, SubmitScoreResponse},
    error::AppError,
    repositories::score_repo::NewScoreRecord,
    repositories::{archive_repo, score_repo},
    state::AppState,
};

pub async fn submit_score(
    state: &AppState,
    user_id: i64,
    payload: SubmitScoreRequest,
) -> Result<SubmitScoreResponse, AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;

    validate_score_payload(&payload)?;

    let eat_food_count = payload.eat_food_count.unwrap_or(0);
    let eat_fish_count = payload.eat_fish_count.unwrap_or(0);
    let revive_used = payload.revive_used.unwrap_or(0);
    let previous_archive = archive_repo::find_by_user_id(pool, user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    let inserted = score_repo::insert_score(
        pool,
        NewScoreRecord {
            user_id,
            score: payload.score,
            survival_seconds: payload.survival_seconds,
            max_stage: payload.max_stage,
            eat_food_count,
            eat_fish_count,
            revive_used,
            client_ts: payload.client_ts,
        },
    )
    .await?;

    let coin_reward = payload.score / 10;
    score_repo::update_best_score_if_higher(pool, user_id, inserted.score).await?;
    score_repo::add_coin(pool, user_id, coin_reward).await?;

    let archive = archive_repo::find_by_user_id(pool, user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    Ok(SubmitScoreResponse {
        best_score: archive.best_score,
        is_new_record: inserted.score > previous_archive.best_score,
        coin_reward,
    })
}

fn validate_score_payload(payload: &SubmitScoreRequest) -> Result<(), AppError> {
    if payload.score < 0
        || payload.survival_seconds < 0
        || !(1..=8).contains(&payload.max_stage)
        || payload.score > 999_999
        || payload.survival_seconds > 3600
        || payload.eat_food_count.unwrap_or(0) < 0
        || payload.eat_fish_count.unwrap_or(0) < 0
        || payload.revive_used.unwrap_or(0) < 0
    {
        return Err(AppError::ScoreInvalid);
    }

    Ok(())
}
