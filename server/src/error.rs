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
