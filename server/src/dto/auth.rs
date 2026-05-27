use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginRequest {
    pub code: String,
    pub anonymous_id: Option<String>,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: LoginUser,
}

#[derive(Serialize)]
pub struct LoginUser {
    pub user_id: i64,
    pub nickname: String,
    pub avatar_url: String,
    pub coin: i32,
    pub best_score: i32,
}
