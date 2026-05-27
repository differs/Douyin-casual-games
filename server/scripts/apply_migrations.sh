#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required"
  exit 1
fi

psql "$DATABASE_URL" -f migrations/0001_init_users_and_archives.sql
psql "$DATABASE_URL" -f migrations/0002_add_score_reward_and_event_tables.sql

echo "migrations applied"
