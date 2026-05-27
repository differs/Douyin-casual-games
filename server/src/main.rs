mod app;
mod config;
mod db;
mod dto;
mod error;
mod extractors;
mod handlers;
mod models;
mod repositories;
mod response;
mod router;
mod services;
mod state;

use std::io;

use tokio::net::TcpListener;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{app::build_app, config::AppConfig, db::postgres, state::AppState};

#[tokio::main]
async fn main() -> Result<(), io::Error> {
    dotenvy::dotenv().ok();

    let config = AppConfig::from_env();
    init_tracing(&config.log_filter);

    let db = match config.database_url.as_deref() {
        Some(database_url) => match postgres::connect(database_url).await {
            Ok(pool) => {
                info!("postgres connected");
                Some(pool)
            }
            Err(error) => {
                tracing::warn!(%error, "postgres connection failed; starting without database");
                None
            }
        },
        None => {
            info!("DATABASE_URL not set; starting without database");
            None
        }
    };

    let addr = config.socket_addr();
    let state = AppState::new(config, db);
    let app = build_app(state);
    let listener = TcpListener::bind(addr).await?;

    info!("server listening on {}", listener.local_addr()?);

    axum::serve(listener, app).await
}

fn init_tracing(log_filter: &str) {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(log_filter))
        .with(tracing_subscriber::fmt::layer())
        .init();
}
