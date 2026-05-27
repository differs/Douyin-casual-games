CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    platform VARCHAR(32) NOT NULL DEFAULT 'douyin',
    platform_open_id VARCHAR(128) NOT NULL UNIQUE,
    nickname VARCHAR(64) NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_archives (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    best_score INTEGER NOT NULL DEFAULT 0,
    coin INTEGER NOT NULL DEFAULT 0,
    current_skin_id VARCHAR(64) NOT NULL DEFAULT 'default_fish',
    owned_skin_ids JSONB NOT NULL DEFAULT '["default_fish"]'::jsonb,
    audio_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    revive_used_today INTEGER NOT NULL DEFAULT 0,
    ad_reward_claimed_today INTEGER NOT NULL DEFAULT 0,
    last_daily_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

