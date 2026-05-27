use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize)]
pub struct AdRewardRequest {
    pub reward_type: String,
    pub unique_token: String,
    pub extra: Option<Value>,
}

#[derive(Serialize)]
pub struct AdRewardResponse {
    pub granted: bool,
    pub coin: i32,
}
