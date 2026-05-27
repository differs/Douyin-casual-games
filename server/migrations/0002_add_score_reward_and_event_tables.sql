CREATE TABLE IF NOT EXISTS score_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    survival_seconds INTEGER NOT NULL DEFAULT 0 CHECK (survival_seconds >= 0),
    max_stage INTEGER NOT NULL DEFAULT 1 CHECK (max_stage >= 1 AND max_stage <= 8),
    eat_food_count INTEGER NOT NULL DEFAULT 0 CHECK (eat_food_count >= 0),
    eat_fish_count INTEGER NOT NULL DEFAULT 0 CHECK (eat_fish_count >= 0),
    revive_used INTEGER NOT NULL DEFAULT 0 CHECK (revive_used >= 0),
    client_ts BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_records_user_id
    ON score_records(user_id);

CREATE INDEX IF NOT EXISTS idx_score_records_created_at
    ON score_records(created_at DESC);

CREATE TABLE IF NOT EXISTS ad_reward_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(32) NOT NULL,
    reward_date DATE NOT NULL,
    unique_token VARCHAR(128) NOT NULL UNIQUE,
    reward_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_reward_records_user_date
    ON ad_reward_records(user_id, reward_date);

CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_logs_user_id
    ON event_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_event_logs_event_name
    ON event_logs(event_name);

CREATE INDEX IF NOT EXISTS idx_event_logs_created_at
    ON event_logs(created_at DESC);
