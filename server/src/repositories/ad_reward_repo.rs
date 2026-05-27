use chrono::Utc;
use serde_json::Value;
use sqlx::{PgPool, query, query_as};

use crate::{error::AppError, models::ad_reward::AdRewardRecord};

pub async fn find_by_unique_token(
    pool: &PgPool,
    unique_token: &str,
) -> Result<Option<AdRewardRecord>, AppError> {
    query_as::<_, AdRewardRecord>(
        r#"
        SELECT id, user_id, reward_type, reward_date, unique_token
        FROM ad_reward_records
        WHERE unique_token = $1
        "#,
    )
    .bind(unique_token)
    .fetch_optional(pool)
    .await
    .map_err(|_| AppError::Internal("ad_reward_query_failed"))
}

pub async fn count_by_user_and_date(
    pool: &PgPool,
    user_id: i64,
    reward_type: &str,
) -> Result<i64, AppError> {
    let today = Utc::now().date_naive();

    sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*)
        FROM ad_reward_records
        WHERE user_id = $1 AND reward_type = $2 AND reward_date = $3
        "#,
    )
    .bind(user_id)
    .bind(reward_type)
    .bind(today)
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::Internal("ad_reward_count_failed"))
}

pub async fn insert_reward(
    pool: &PgPool,
    user_id: i64,
    reward_type: &str,
    unique_token: &str,
    reward_payload: &Value,
) -> Result<(), AppError> {
    let today = Utc::now().date_naive();

    query(
        r#"
        INSERT INTO ad_reward_records (user_id, reward_type, reward_date, unique_token, reward_payload)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(user_id)
    .bind(reward_type)
    .bind(today)
    .bind(unique_token)
    .bind(sqlx::types::Json(reward_payload))
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("ad_reward_insert_failed"))?;

    Ok(())
}
