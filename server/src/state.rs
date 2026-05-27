use sqlx::PgPool;

use crate::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub db: Option<PgPool>,
}

impl AppState {
    pub fn new(config: AppConfig, db: Option<PgPool>) -> Self {
        Self { config, db }
    }
}
