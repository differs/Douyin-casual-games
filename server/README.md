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

Apply the current migration:

```bash
psql postgres://postgres:postgres@127.0.0.1:5432/dy_mini -f migrations/0001_init_users_and_archives.sql
psql postgres://postgres:postgres@127.0.0.1:5432/dy_mini -f migrations/0002_add_score_reward_and_event_tables.sql
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
