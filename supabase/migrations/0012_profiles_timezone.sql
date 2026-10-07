-- 0012: Store each user's timezone on their profile.
--
-- Additive only. "Today" used to be computed in UTC, so in Eastern time the day
-- rolled over at ~20:00 (habits/meals/stats reset mid-evening). The app now
-- resolves "today" in the user's timezone. TimezoneSync detects it client-side
-- and persists it here (and to a cookie for fast server reads). NOT NULL with a
-- default backfills every existing row to America/Toronto.

alter table profiles
  add column if not exists timezone text not null default 'America/Toronto';
