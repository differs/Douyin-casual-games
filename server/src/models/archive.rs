use sqlx::FromRow;

#[derive(Clone, Debug, FromRow)]
pub struct UserArchive {
    #[allow(dead_code)]
    pub user_id: i64,
    pub best_score: i32,
    pub coin: i32,
    pub current_skin_id: String,
    pub owned_skin_ids: sqlx::types::Json<Vec<String>>,
    pub audio_enabled: bool,
    pub revive_used_today: i32,
    pub ad_reward_claimed_today: i32,
}
