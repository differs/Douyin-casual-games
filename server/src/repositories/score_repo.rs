use sqlx::{PgPool, query, query_as};

use crate::{error::AppError, models::score::ScoreRecord};

pub struct NewScoreRecord {
    pub user_id: i64,
    pub score: i32,
    pub survival_seconds: i32,
    pub max_stage: i32,
    pub eat_food_count: i32,
    pub eat_fish_count: i32,
    pub revive_used: i32,
    pub client_ts: Option<i64>,
}

pub async fn insert_score(
    pool: &PgPool,
    new_score: NewScoreRecord,
) -> Result<ScoreRecord, AppError> {
    query_as::<_, ScoreRecord>(
        r#"
        INSERT INTO score_records (
            user_id, score, survival_seconds, max_stage, eat_food_count, eat_fish_count, revive_used, client_ts
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, score
        "#,
    )
    .bind(new_score.user_id)
    .bind(new_score.score)
    .bind(new_score.survival_seconds)
    .bind(new_score.max_stage)
    .bind(new_score.eat_food_count)
    .bind(new_score.eat_fish_count)
    .bind(new_score.revive_used)
    .bind(new_score.client_ts)
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::Internal("score_insert_failed"))
}

pub async fn update_best_score_if_higher(
    pool: &PgPool,
    user_id: i64,
    score: i32,
) -> Result<(), AppError> {
    query(
        r#"
        UPDATE user_archives
        SET best_score = GREATEST(best_score, $2), updated_at = NOW()
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .bind(score)
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("best_score_update_failed"))?;

    Ok(())
}

pub async fn add_coin(pool: &PgPool, user_id: i64, coin_delta: i32) -> Result<(), AppError> {
    query(
        r#"
        UPDATE user_archives
        SET coin = coin + $2, updated_at = NOW()
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .bind(coin_delta)
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("coin_update_failed"))?;

    Ok(())
}
