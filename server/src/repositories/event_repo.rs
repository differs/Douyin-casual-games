use serde_json::Value;
use sqlx::{PgPool, query};

use crate::error::AppError;

pub async fn insert_event(
    pool: &PgPool,
    user_id: i64,
    event_name: &str,
    payload: &Value,
) -> Result<(), AppError> {
    query(
        r#"
        INSERT INTO event_logs (user_id, event_name, payload)
        VALUES ($1, $2, $3)
        "#,
    )
    .bind(user_id)
    .bind(event_name)
    .bind(sqlx::types::Json(payload))
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("event_insert_failed"))?;

    Ok(())
}
