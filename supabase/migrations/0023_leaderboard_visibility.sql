-- 0023_leaderboard_visibility.sql
-- R7: let a member opt out of appearing (by name) in leaderboards and groups.
--
-- ADDITIVE ONLY: adds one boolean column (default true, so existing members keep
-- appearing) and re-publishes the profile_public view with that column added at
-- the end. No column is dropped or retyped, no row is deleted. CREATE OR REPLACE
-- VIEW keeps the view's existing grants; its security options are restated
-- verbatim so nothing about who-can-read changes.

alter table public.profiles
  add column if not exists show_on_leaderboard boolean not null default true;

-- profile_public stays the RLS-bypassing "safe" projection (only non-sensitive
-- columns, never email). We append show_on_leaderboard so the leaderboard query
-- can honor the opt-out without widening what's exposed.
create or replace view public.profile_public
  with (security_invoker = false, security_barrier = true) as
  select id, name, avatar_url, level, xp, streak, show_on_leaderboard
  from public.profiles;
