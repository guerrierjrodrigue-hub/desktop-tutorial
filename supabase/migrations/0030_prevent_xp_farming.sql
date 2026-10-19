-- 0030_prevent_xp_farming.sql
-- W1: stop XP farming from workouts.
--
-- Two problems with the old ka_xp_workout trigger:
--   1. Every logged session awarded 30 XP, even an empty "finish anyway" tap.
--   2. Its idempotency key included the program day (ref_id = workout_day_id),
--      so logging 24 program days on one calendar day paid 24 x 30 XP.
--
-- This migration:
--   - adds sets_done / sets_total to workout_logs (additive) so the server can
--     record and the trigger can judge how much of the session was actually done;
--   - rewrites ka_xp_workout to award XP only for a genuine workout (at least
--     half the sets done AND at least 5 real minutes) and at most once per LOCAL
--     day per user (ref_id = ''), regardless of which program day;
--   - counts workout badges by distinct active day, never by raw session rows,
--     so an empty session can never move a badge;
--   - recomputes cached profiles.xp and re-evaluates badges.
--
-- XP-source audit (the cap on every other source — none shares the workout bug,
-- because each is keyed so repeating the SAME action cannot re-award):
--   * habit        (ka_xp_habit)    10 XP, keyed (user, 'habit', habit_id, log_date)
--                                   -> at most once per habit per day; re-toggling
--                                      does not re-award. Bounded by the user's habits.
--   * journal      (ka_xp_journal)  15 XP, keyed (user, 'journal', '', local day)
--                                   -> at most once per day (hard daily cap).
--   * prayer       (ka_xp_prayer)   10 XP, keyed (user, 'prayer', prayer_id, local day)
--                                   -> once per prayer entry; re-saving the same
--                                      prayer does not re-award. Bounded by genuine
--                                      entries (not the repeat-one-action abuse).
--   * reading_day  (ka_xp_reading)  10 XP, keyed (user, 'reading_day', plan:dayN, ...)
--                                   -> once per plan per completed-day milestone.
--                                      Bounded by the plan length.
--   * challenge    (ka_xp_challenge)20 XP, keyed (user, 'challenge_join', challenge_id, ...)
--                                   -> once per challenge. Bounded by challenges.
-- ADDITIVE: only new columns + function bodies + an idempotent data recompute.

alter table public.workout_logs add column if not exists sets_done smallint not null default 0;
alter table public.workout_logs add column if not exists sets_total smallint not null default 0;

-- Award workout XP only for a genuine session, once per local day per user.
create or replace function public.ka_xp_workout() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(NEW.duration_minutes, 0) >= 5
     and coalesce(NEW.sets_total, 0) > 0
     and NEW.sets_done * 2 >= NEW.sets_total then
    perform ka_award_xp(NEW.user_id, 'workout', '',
      ka_local_day(NEW.completed_at, NEW.user_id), 30);
  end if;
  return NEW;
end; $$;

-- Badges from real activity: count distinct active days for workouts, so empty
-- or repeated same-day sessions can never advance first-steps / iron-discipline.
create or replace function public.evaluate_badges(p_uid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  with days as (
    select distinct day d from xp_events where user_id = p_uid
  ),
  runs as (
    select d, (d - (row_number() over (order by d))::int) as grp from days
  ),
  longest as (
    select coalesce(max(cnt), 0) m from (
      select count(*) cnt from runs group by grp
    ) s
  ),
  counts as (
    select
      count(distinct day) filter (where type = 'workout') as wk,
      count(*) filter (where type = 'reading_day') as rd,
      count(*) filter (where type = 'prayer') as pr
    from xp_events where user_id = p_uid
  )
  insert into user_badges (user_id, badge_id, earned_at)
  select p_uid, b.id, now()
  from badges b, counts c, longest l
  where (b.slug = 'first-steps' and c.wk >= 1)
     or (b.slug = 'iron-discipline' and c.wk >= 50)
     or (b.slug = 'word-warrior' and c.rd >= 30)
     or (b.slug = 'prayer-pillar' and c.pr >= 100)
     or (b.slug = 'seven-day-fire' and l.m >= 7)
     or (b.slug = 'marathon-soul' and l.m >= 100)
  on conflict (user_id, badge_id) do nothing;
end; $$;

-- Data correction: recompute cached XP and re-evaluate badges from xp_events.
-- (At apply time no farmed workout XP existed — 0 workout_logs / 0 workout
-- xp_events — so this only re-asserts the invariant; it is safe to re-run.)
update profiles p
set xp = coalesce((select sum(e.xp) from xp_events e where e.user_id = p.id), 0);

do $$
declare r record;
begin
  for r in select id from profiles loop
    perform evaluate_badges(r.id);
  end loop;
end $$;
