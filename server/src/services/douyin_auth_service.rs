use serde::Deserialize;

use crate::{error::AppError, state::AppState};

#[derive(Deserialize)]
struct Code2SessionResponse {
    data: Option<Code2SessionData>,
    err_no: Option<i32>,
    err_tips: Option<String>,
}

#[derive(Deserialize)]
struct Code2SessionData {
    openid: String,
    #[allow(dead_code)]
    session_key: Option<String>,
    #[allow(dead_code)]
    unionid: Option<String>,
}

pub async fn exchange_code(state: &AppState, code: &str) -> Result<String, AppError> {
    if code.starts_with("dev_") {
        return Ok(format!("mock_open_id:{code}"));
    }

    let app_id = state
        .config
        .douyin_app_id
        .as_deref()
        .ok_or(AppError::LoginFailed("douyin_app_id_missing"))?;
    let app_secret = state
        .config
        .douyin_app_secret
        .as_deref()
        .ok_or(AppError::LoginFailed("douyin_app_secret_missing"))?;

    let client = reqwest::Client::new();
    let response = client
        .get(&state.config.douyin_code2session_url)
        .query(&[
            ("appid", app_id),
            ("secret", app_secret),
            ("code", code),
        ])
        .send()
        .await
        .map_err(|_| AppError::LoginFailed("code2session_request_failed"))?;

    let body = response
        .json::<Code2SessionResponse>()
        .await
        .map_err(|_| AppError::LoginFailed("code2session_parse_failed"))?;

    if let Some(data) = body.data {
        if !data.openid.trim().is_empty() {
            return Ok(data.openid);
        }
    }

    let err_no = body.err_no.unwrap_or_default();
    let err_tips = body
        .err_tips
        .unwrap_or_else(|| "code2session_failed".to_string());

    tracing::warn!(err_no, err_tips = %err_tips, "douyin code2session failed");
    Err(AppError::LoginFailed("code2session_failed"))
}
