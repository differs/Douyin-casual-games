use axum::{
    Router,
    routing::{get, post},
};

use crate::handlers;

pub fn build_router() -> Router<crate::state::AppState> {
    Router::new()
        .route("/health", get(handlers::health::health))
        .route("/api/login", post(handlers::auth::login))
        .route("/api/user/profile", get(handlers::user::profile))
        .route("/api/score/submit", post(handlers::score::submit_score))
        .route("/api/ad/reward", post(handlers::ad_reward::claim_reward))
        .route(
            "/api/event/report",
            post(handlers::analytics::report_events),
        )
        .route(
            "/api/user/archive",
            get(handlers::archive::get_archive).post(handlers::archive::save_archive),
        )
}
