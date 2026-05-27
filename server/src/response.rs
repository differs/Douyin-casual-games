use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub code: i32,
    pub message: &'static str,
    pub data: T,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            code: 0,
            message: "ok",
            data,
        }
    }
}
