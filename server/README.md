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

## Local Postgres Bootstrap

Create the database:

```bash
createdb dy_mini
```

Set `DATABASE_URL` in `.env`:

```bash
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/dy_mini
```

Optional Douyin login config:

```bash
DOUYIN_APP_ID=your_microapp_appid
DOUYIN_APP_SECRET=your_microapp_secret
```

Apply the current migration:

```bash
./scripts/apply_migrations.sh
```

Then start the server:

```bash
cargo run
```

Current API routes:

```text
GET  /health
POST /api/login
GET  /api/user/profile
GET  /api/user/archive
POST /api/user/archive
POST /api/score/submit
POST /api/ad/reward
POST /api/event/report
```

## Login Behavior

- Development fallback: codes beginning with `dev_` use mock openid mapping
- Douyin Mini Game runtime: frontend uses `tt.login`, backend exchanges code through `code2session`

## Local Frontend Debug

The server now allows permissive CORS for local prototype debugging, so the Vite frontend can call:

```text
http://127.0.0.1:8080/api
```
