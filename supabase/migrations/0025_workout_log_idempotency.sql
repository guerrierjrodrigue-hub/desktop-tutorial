-- S2 — Workout logging: make a workout-day completion idempotent per calendar
-- day, so a double-click (or a retried request) records at most one log per
-- workout-day per date. Additive only.

-- A stored calendar date derived from completed_at. We use the UTC date (the DB
-- runs in UTC), which matches the day the XP trigger ka_xp_workout keys on
-- (completed_at::date), so XP and this idempotency key never diverge.
-- The expression is immutable (timestamptz -> timestamp at a fixed zone -> date),
-- which a generated column requires. Existing rows backfill automatically.
alter table workout_logs
  add column if not exists log_date date
  generated always as (((completed_at at time zone 'UTC'))::date) stored;

-- One completion per (user, workout-day, date). Partial so the many historical
-- rows with a null workout_day_id (logged before S2) are never constrained, and
-- so free-form "active minutes" logs that carry no workout-day stay unaffected.
create unique index if not exists ux_workout_logs_user_day_date
  on workout_logs (user_id, workout_day_id, log_date)
  where workout_day_id is not null;
