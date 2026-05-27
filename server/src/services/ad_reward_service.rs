use serde_json::json;

use crate::{
    dto::ad_reward::{AdRewardRequest, AdRewardResponse},
    error::AppError,
    repositories::{ad_reward_repo, archive_repo, score_repo},
    state::AppState,
};

pub async fn claim_reward(
    state: &AppState,
    user_id: i64,
    payload: AdRewardRequest,
) -> Result<AdRewardResponse, AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;

    let reward_type = payload.reward_type.trim();
    let unique_token = payload.unique_token.trim();

    if reward_type.is_empty() || unique_token.is_empty() {
        return Err(AppError::InvalidParams("reward_params_required"));
    }

    if !matches!(reward_type, "revive" | "double_coin" | "daily_boost") {
        return Err(AppError::InvalidParams("reward_type_invalid"));
    }

    if ad_reward_repo::find_by_unique_token(pool, unique_token)
        .await?
        .is_some()
    {
        return Err(AppError::RewardAlreadyClaimed);
    }

    let today_count = ad_reward_repo::count_by_user_and_date(pool, user_id, reward_type).await?;
    let daily_limit = match reward_type {
        "revive" => 20,
        "double_coin" => 20,
        "daily_boost" => 1,
        _ => 0,
    };

    if today_count >= daily_limit {
        return Err(AppError::RewardLimitReached);
    }

    let coin_reward = match reward_type {
        "revive" => 0,
        "double_coin" => payload
            .extra
            .as_ref()
            .and_then(|value| value.get("coin_reward"))
            .and_then(|value| value.as_i64())
            .unwrap_or(0)
            .clamp(0, 10_000) as i32,
        "daily_boost" => 50,
        _ => 0,
    };
    let reward_payload = payload.extra.unwrap_or_else(|| json!({}));

    ad_reward_repo::insert_reward(pool, user_id, reward_type, unique_token, &reward_payload)
        .await?;

    if coin_reward > 0 {
        score_repo::add_coin(pool, user_id, coin_reward).await?;
    }

    let archive = archive_repo::find_by_user_id(pool, user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    Ok(AdRewardResponse {
        granted: true,
        coin: archive.coin + coin_reward,
    })
}
