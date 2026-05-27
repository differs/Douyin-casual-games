use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize)]
pub struct EventReportRequest {
    pub events: Vec<EventInput>,
}

#[derive(Deserialize)]
pub struct EventInput {
    pub event_name: String,
    pub event_time: i64,
    pub payload: Option<Value>,
}

#[derive(Serialize)]
pub struct EventReportResponse {
    pub accepted: usize,
}
