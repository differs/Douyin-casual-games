use sqlx::FromRow;

#[derive(Clone, Debug, FromRow)]
pub struct User {
    pub id: i64,
    #[allow(dead_code)]
    pub platform_open_id: String,
    pub nickname: String,
    pub avatar_url: String,
}
