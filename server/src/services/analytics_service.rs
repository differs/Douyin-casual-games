use serde_json::json;

use crate::{
    dto::analytics::{EventReportRequest, EventReportResponse},
    error::AppError,
    repositories::event_repo,
    state::AppState,
};

pub async fn report_events(
    state: &AppState,
    user_id: i64,
    payload: EventReportRequest,
) -> Result<EventReportResponse, AppError> {
    let pool = state
        .db
        .as_ref()
        .ok_or(AppError::ServiceUnavailable("database_unavailable"))?;

    let mut accepted = 0usize;

    for event in payload.events {
        let event_name = event.event_name.trim();
        if event_name.is_empty() {
            continue;
        }

        let body = json!({
            "event_time": event.event_time,
            "payload": event.payload.unwrap_or_else(|| json!({}))
        });

        event_repo::insert_event(pool, user_id, event_name, &body).await?;
        accepted += 1;
    }

    Ok(EventReportResponse { accepted })
}
