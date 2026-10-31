-- 0039_running_badges_challenges.sql
-- A1.5: running badges and per-mode cohort challenges.
--
-- This migration:
--   - seeds four running badges (first run, 5 km, 10 km, four weeks of
--     consistency), keyed by stable slug and idempotent;
--   - tags challenges with an `activity` (strength / running / both) so the list
--     can show only the account's mode plus the common ones, and seeds two
--     running cohort challenges (number of runs, kilometres);
--   - extends evaluate_badges to award the running badges from the `runs` table,
--     using the SAME genuine-effort gate as run XP (at least 10 min and 1 km) so
--     an empty or trivial entry can never move a badge;
--   - makes a run always re-evaluate badges, so a genuine back-dated run (which
--     does not earn XP outside the 2-day window) still unlocks its distance badge.
-- ADDITIVE: new rows, one new column + check, and replaced function bodies.

-- --- Running badges (idempotent on slug) -----------------------------------
insert into public.badges (slug, name, name_fr, description, description_fr, icon) values
  ('first-run',   'First run',        'Première sortie',          'Logged your first run',                 'A enregistré sa première sortie',            'Footprints'),
  ('run-5k',      '5 km',             '5 km',                     'Completed a run of 5 km or more',       'A terminé une sortie de 5 km ou plus',       'Medal'),
  ('run-10k',     '10 km',            '10 km',                    'Completed a run of 10 km or more',      'A terminé une sortie de 10 km ou plus',      'Trophy'),
  ('run-4-weeks', '4 weeks running',  '4 semaines de régularité', 'Ran at least once a week for 4 weeks',  'A couru au moins une fois par semaine pendant 4 semaines', 'CalendarCheck')
on conflict (slug) do nothing;

-- Backfill the French columns if the rows pre-existed without them.
update public.badges set name_fr = 'Première sortie',          description_fr = 'A enregistré sa première sortie'                        where slug = 'first-run'   and name_fr is null;
update public.badges set name_fr = '5 km',                     description_fr = 'A terminé une sortie de 5 km ou plus'                    where slug = 'run-5k'      and name_fr is null;
update public.badges set name_fr = '10 km',                    description_fr = 'A terminé une sortie de 10 km ou plus'                   where slug = 'run-10k'     and name_fr is null;
update public.badges set name_fr = '4 semaines de régularité', description_fr = 'A couru au moins une fois par semaine pendant 4 semaines' where slug = 'run-4-weeks' and name_fr is null;

-- --- Per-mode challenges ----------------------------------------------------
alter table public.challenges
  add column if not exists activity text not null default 'both';
alter table public.challenges drop constraint if exists challenges_activity_check;
alter table public.challenges
  add constraint challenges_activity_check check (activity in ('strength', 'running', 'both'));

-- Workout-metric cohorts belong to the strength mode; everything else stays
-- common ("both") unless it is one of the running cohorts seeded below.
update public.challenges set activity = 'strength' where metric = 'workouts' and activity = 'both';

-- Two running cohorts: a count of runs and a total distance. Seeded once.
insert into public.challenges (title, title_fr, description, description_fr, type, duration_days, metric, activity)
select '12 Runs in 2 Weeks', '12 sorties en 2 semaines',
       'You and your cohort: log 12 genuine runs in two weeks.',
       'Toi et ta cohorte : enregistre 12 sorties réelles en deux semaines.',
       'friends', 14, 'runs', 'running'
where not exists (select 1 from public.challenges where metric = 'runs' and activity = 'running');

insert into public.challenges (title, title_fr, description, description_fr, type, duration_days, metric, activity)
select '50 km This Month', '50 km ce mois-ci',
       'Reach 50 km together this month, one run at a time.',
       'Atteins 50 km ensemble ce mois-ci, une sortie à la fois.',
       'friends', 30, 'kilometers', 'running'
where not exists (select 1 from public.challenges where metric = 'kilometers' and activity = 'running');

-- --- Badge evaluation (strength + running) ----------------------------------
-- Running badges read the `runs` table directly with the genuine-effort gate
-- (>= 10 min and >= 1 km), so they share the same anti-cheat bar as run XP.
create or replace function public.evaluate_badges(p_uid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  with days as (
    select distinct day d from xp_events where user_id = p_uid
  ),
  day_runs as (
    select d, (d - (row_number() over (order by d))::int) as grp from days
  ),
  longest as (
    select coalesce(max(cnt), 0) m from (
      select count(*) cnt from day_runs group by grp
    ) s
  ),
  counts as (
    select
      count(distinct day) filter (where type = 'workout') as wk,
      count(*) filter (where type = 'reading_day') as rd,
      count(*) filter (where type = 'prayer') as pr
    from xp_events where user_id = p_uid
  ),
  -- Genuine runs only (same gate as run XP).
  good_runs as (
    select ran_on, distance_m
    from runs
    where user_id = p_uid and duration_s >= 600 and distance_m >= 1000
  ),
  run_stats as (
    select
      count(*) as n,
      coalesce(max(distance_m), 0) as max_m
    from good_runs
  ),
  -- Distinct ISO weeks with a genuine run; consecutive weeks are 7 days apart,
  -- so subtracting row_number * 7 days groups a streak into one bucket.
  run_weeks as (
    select distinct date_trunc('week', ran_on)::date w from good_runs
  ),
  week_grp as (
    select (w - (row_number() over (order by w)::int * 7))::date grp from run_weeks
  ),
  longest_weeks as (
    select coalesce(max(cnt), 0) m from (
      select count(*) cnt from week_grp group by grp
    ) s
  )
  insert into user_badges (user_id, badge_id, earned_at)
  select p_uid, b.id, now()
  from badges b, counts c, longest l, run_stats rs, longest_weeks lw
  where (b.slug = 'first-steps' and c.wk >= 1)
     or (b.slug = 'iron-discipline' and c.wk >= 50)
     or (b.slug = 'word-warrior' and c.rd >= 30)
     or (b.slug = 'prayer-pillar' and c.pr >= 100)
     or (b.slug = 'seven-day-fire' and l.m >= 7)
     or (b.slug = 'marathon-soul' and l.m >= 100)
     or (b.slug = 'first-run' and rs.n >= 1)
     or (b.slug = 'run-5k' and rs.max_m >= 5000)
     or (b.slug = 'run-10k' and rs.max_m >= 10000)
     or (b.slug = 'run-4-weeks' and lw.m >= 4)
  on conflict (user_id, badge_id) do nothing;
end; $$;

-- A run always re-evaluates badges (not only when it earns XP), so a genuine
-- run that falls outside the XP date window still unlocks its distance badge.
create or replace function public.ka_xp_run() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_today date;
begin
  v_today := ka_local_day(now(), NEW.user_id);
  if coalesce(NEW.duration_s, 0) >= 600
     and coalesce(NEW.distance_m, 0) >= 1000
     and NEW.ran_on <= v_today
     and NEW.ran_on >= v_today - 1 then
    perform ka_award_xp(NEW.user_id, 'run', '', NEW.ran_on, 30);
  end if;
  perform evaluate_badges(NEW.user_id);
  return NEW;
end; $$;

-- Re-evaluate everyone so existing runners earn the new badges immediately.
do $$
declare r record;
begin
  for r in select id from profiles loop
    perform evaluate_badges(r.id);
  end loop;
end $$;
