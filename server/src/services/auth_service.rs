use crate::{
    dto::auth::{LoginRequest, LoginResponse, LoginUser},
    error::AppError,
    extractors::auth::build_token,
    repositories::{archive_repo, user_repo},
    services::douyin_auth_service,
    state::AppState,
};

pub async fn login(state: &AppState, payload: LoginRequest) -> Result<LoginResponse, AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;

    let code = payload.code.trim();
    if code.is_empty() {
        return Err(AppError::InvalidParams("code_required"));
    }

    let platform_open_id = douyin_auth_service::exchange_code(state, code).await?;
    let mut nickname = format!("玩家{}", code.chars().take(6).collect::<String>());
    if let Some(anonymous_id) = payload.anonymous_id.as_deref() {
        if !anonymous_id.trim().is_empty() {
            nickname = format!("玩家{}", anonymous_id.chars().take(6).collect::<String>());
        }
    }

    let avatar_url = String::new();

    let user = match user_repo::find_by_platform_open_id(pool, &platform_open_id).await? {
        Some(user) => {
            user_repo::update_profile(pool, user.id, &nickname, &avatar_url).await?;
            user_repo::find_by_id(pool, user.id)
                .await?
                .ok_or(AppError::UserNotFound)?
        }
        None => user_repo::create(pool, &platform_open_id, &nickname, &avatar_url).await?,
    };

    archive_repo::create_default(pool, user.id).await?;
    let archive = archive_repo::find_by_user_id(pool, user.id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    Ok(LoginResponse {
        token: build_token(&state.config.token_prefix, user.id),
        user: LoginUser {
            user_id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            coin: archive.coin,
            best_score: archive.best_score,
        },
    })
}
