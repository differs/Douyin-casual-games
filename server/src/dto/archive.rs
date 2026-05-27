use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct ArchiveResponse {
    pub best_score: i32,
    pub coin: i32,
    pub current_skin_id: String,
    pub owned_skin_ids: Vec<String>,
    pub audio_enabled: bool,
    pub daily: DailyArchive,
}

#[derive(Serialize)]
pub struct DailyArchive {
    pub revive_used: i32,
    pub ad_reward_claimed: i32,
}

#[derive(Deserialize)]
pub struct SaveArchiveRequest {
    pub current_skin_id: Option<String>,
    pub audio_enabled: Option<bool>,
}

#[derive(Serialize)]
pub struct SaveArchiveResponse {
    pub saved: bool,
}
