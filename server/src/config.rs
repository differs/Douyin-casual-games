use std::{env, net::SocketAddr};

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub app_env: String,
    pub host: String,
    pub port: u16,
    pub database_url: Option<String>,
    pub log_filter: String,
    pub token_prefix: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let app_env = env::var("APP_ENV").unwrap_or_else(|_| "development".to_string());
        let host = env::var("APP_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let port = env::var("APP_PORT")
            .ok()
            .and_then(|value| value.parse::<u16>().ok())
            .unwrap_or(8080);
        let database_url = env::var("DATABASE_URL")
            .ok()
            .filter(|value| !value.is_empty());
        let log_filter =
            env::var("RUST_LOG").unwrap_or_else(|_| "server=debug,tower_http=info".to_string());
        let token_prefix = env::var("TOKEN_PREFIX").unwrap_or_else(|_| "dymini".to_string());

        Self {
            app_env,
            host,
            port,
            database_url,
            log_filter,
            token_prefix,
        }
    }

    pub fn socket_addr(&self) -> SocketAddr {
        format!("{}:{}", self.host, self.port)
            .parse()
            .expect("APP_HOST and APP_PORT must form a valid socket address")
    }
}
