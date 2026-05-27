use serde::Serialize;

#[derive(Serialize)]
pub struct UserProfileResponse {
    pub user_id: i64,
    pub nickname: String,
    pub avatar_url: String,
    pub coin: i32,
    pub best_score: i32,
    pub current_skin_id: String,
    pub audio_enabled: bool,
}
