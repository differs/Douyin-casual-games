use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;

#[derive(Debug)]
pub enum AppError {
    InvalidToken,
    InvalidParams(&'static str),
    UserNotFound,
    ScoreInvalid,
    RewardAlreadyClaimed,
    RewardLimitReached,
    ServiceUnavailable(&'static str),
    Internal(&'static str),
}

#[derive(Serialize)]
struct ErrorBody {
    code: i32,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            Self::InvalidToken => (
                StatusCode::UNAUTHORIZED,
                Json(ErrorBody {
                    code: 1001,
                    message: "invalid_token".to_string(),
                }),
            )
                .into_response(),
            Self::InvalidParams(message) => (
                StatusCode::BAD_REQUEST,
                Json(ErrorBody {
                    code: 1003,
                    message: message.to_string(),
                }),
            )
                .into_response(),
            Self::UserNotFound => (
                StatusCode::NOT_FOUND,
                Json(ErrorBody {
                    code: 1004,
                    message: "user_not_found".to_string(),
                }),
            )
                .into_response(),
            Self::ScoreInvalid => (
                StatusCode::BAD_REQUEST,
                Json(ErrorBody {
                    code: 1005,
                    message: "score_invalid".to_string(),
                }),
            )
                .into_response(),
            Self::RewardAlreadyClaimed => (
                StatusCode::CONFLICT,
                Json(ErrorBody {
                    code: 1006,
                    message: "reward_already_claimed".to_string(),
                }),
            )
                .into_response(),
            Self::RewardLimitReached => (
                StatusCode::TOO_MANY_REQUESTS,
                Json(ErrorBody {
                    code: 1007,
                    message: "reward_limit_reached".to_string(),
                }),
            )
                .into_response(),
            Self::ServiceUnavailable(message) => (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(ErrorBody {
                    code: 1008,
                    message: message.to_string(),
                }),
            )
                .into_response(),
            Self::Internal(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorBody {
                    code: 1008,
                    message: message.to_string(),
                }),
            )
                .into_response(),
        }
    }
}
