use sqlx::FromRow;

#[allow(dead_code)]
#[derive(Clone, Debug, FromRow)]
pub struct EventLog {
    #[allow(dead_code)]
    pub id: i64,
}
