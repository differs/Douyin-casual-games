use axum::Router;
use tower_http::trace::TraceLayer;

use crate::{router, state::AppState};

pub fn build_app(state: AppState) -> Router {
    Router::new()
        .merge(router::build_router())
        .with_state(state)
        .layer(TraceLayer::new_for_http())
}
