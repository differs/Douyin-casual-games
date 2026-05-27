use sqlx::{PgPool, query, query_as};

use crate::{error::AppError, models::user::User};

pub async fn find_by_id(pool: &PgPool, user_id: i64) -> Result<Option<User>, AppError> {
    query_as::<_, User>(
        r#"
        SELECT id, platform_open_id, nickname, avatar_url
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|_| AppError::Internal("user_query_failed"))
}

pub async fn find_by_platform_open_id(
    pool: &PgPool,
    platform_open_id: &str,
) -> Result<Option<User>, AppError> {
    query_as::<_, User>(
        r#"
        SELECT id, platform_open_id, nickname, avatar_url
        FROM users
        WHERE platform_open_id = $1
        "#,
    )
    .bind(platform_open_id)
    .fetch_optional(pool)
    .await
    .map_err(|_| AppError::Internal("user_query_failed"))
}

pub async fn create(
    pool: &PgPool,
    platform_open_id: &str,
    nickname: &str,
    avatar_url: &str,
) -> Result<User, AppError> {
    query_as::<_, User>(
        r#"
        INSERT INTO users (platform_open_id, nickname, avatar_url)
        VALUES ($1, $2, $3)
        RETURNING id, platform_open_id, nickname, avatar_url
        "#,
    )
    .bind(platform_open_id)
    .bind(nickname)
    .bind(avatar_url)
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::Internal("user_create_failed"))
}

pub async fn update_profile(
    pool: &PgPool,
    user_id: i64,
    nickname: &str,
    avatar_url: &str,
) -> Result<(), AppError> {
    query(
        r#"
        UPDATE users
        SET nickname = $2, avatar_url = $3, updated_at = NOW()
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .bind(nickname)
    .bind(avatar_url)
    .execute(pool)
    .await
    .map_err(|_| AppError::Internal("user_update_failed"))?;

    Ok(())
}
