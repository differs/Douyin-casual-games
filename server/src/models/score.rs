use sqlx::FromRow;

#[derive(Clone, Debug, FromRow)]
pub struct ScoreRecord {
    #[allow(dead_code)]
    pub id: i64,
    pub score: i32,
}
