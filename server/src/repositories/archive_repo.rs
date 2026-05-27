use sqlx::{PgPool, query, query_as};

use crate::{error::AppError, models::archive::UserArchive};

pub async fn find_by_user_id(pool: &PgPool, user_id: i64) -> Result<Option<UserArchive>, AppError> {
    query_as::<_, UserArchive>(
        r#"
        SELECT user_id, best_score, coin, current_skin_id, owned_skin_ids, audio_enabled,
               revive_used_today, ad_reward_claimed_today
        FROM user_archives
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|_| AppError::Internal("archive_query_failed"))
}

pub async fn create_default(pool: &PgPool, user_id: i64) -> Result<(), AppError> {
    query(
        r#"
        INSERT INTO user_archives (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
        "#,
    )
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("archive_create_failed"))?;

    Ok(())
}

pub async fn update_settings(
    pool: &PgPool,
    user_id: i64,
    current_skin_id: Option<&str>,
    audio_enabled: Option<bool>,
) -> Result<(), AppError> {
    query(
        r#"
        UPDATE user_archives
        SET
            current_skin_id = COALESCE($2, current_skin_id),
            audio_enabled = COALESCE($3, audio_enabled),
            updated_at = NOW()
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .bind(current_skin_id)
    .bind(audio_enabled)
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("archive_update_failed"))?;

    Ok(())
}
