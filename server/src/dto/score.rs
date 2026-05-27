use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct SubmitScoreRequest {
    pub score: i32,
    pub survival_seconds: i32,
    pub max_stage: i32,
    pub eat_food_count: Option<i32>,
    pub eat_fish_count: Option<i32>,
    pub revive_used: Option<i32>,
    pub client_ts: Option<i64>,
}

#[derive(Serialize)]
pub struct SubmitScoreResponse {
    pub best_score: i32,
    pub is_new_record: bool,
    pub coin_reward: i32,
}
