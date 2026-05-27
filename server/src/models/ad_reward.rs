use chrono::NaiveDate;
use sqlx::FromRow;

#[derive(Clone, Debug, FromRow)]
pub struct AdRewardRecord {
    #[allow(dead_code)]
    pub id: i64,
    #[allow(dead_code)]
    pub user_id: i64,
    #[allow(dead_code)]
    pub reward_type: String,
    #[allow(dead_code)]
    pub reward_date: NaiveDate,
    #[allow(dead_code)]
    pub unique_token: String,
}
