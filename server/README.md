# Server

## Run

```bash
cp .env.example .env
cargo run
```

If `DATABASE_URL` is not set or the database is unavailable, the server still starts and exposes:

```text
GET /health
```
