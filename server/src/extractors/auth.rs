use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};

use crate::{error::AppError, state::AppState};

pub struct AuthUser {
    pub user_id: i64,
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let header_value = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or(AppError::InvalidToken)?;

        let token = header_value
            .strip_prefix("Bearer ")
            .ok_or(AppError::InvalidToken)?;

        let user_id =
            parse_token(token, &state.config.token_prefix).ok_or(AppError::InvalidToken)?;

        Ok(Self { user_id })
    }
}

pub fn build_token(prefix: &str, user_id: i64) -> String {
    format!("{prefix}_{user_id}")
}

fn parse_token(token: &str, prefix: &str) -> Option<i64> {
    let id_part = token.strip_prefix(&format!("{prefix}_"))?;
    id_part.parse::<i64>().ok()
}
