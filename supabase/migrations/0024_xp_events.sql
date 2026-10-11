-- 0024_xp_events.sql
-- S1 Gamification. ADDITIVE ONLY: one new table, server-side functions/triggers,
-- and a backfill that only INSERTs xp_events and recomputes profiles.xp. No
-- column is dropped or retyped, no row deleted.
--
-- xp_events is the single source of truth for XP. It is written ONLY server-side
-- (SECURITY DEFINER triggers on the source tables); clients have SELECT only and
-- no INSERT/UPDATE/DELETE policy, so XP can never be set or farmed by the client.

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  ref_id text not null default '',
  day date not null,
  xp integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, type, ref_id, day)
);

create index if not exists idx_xp_events_user_day on public.xp_events (user_id, day);

alter table public.xp_events enable row level security;

-- Readable only by its owner. No write policy: inserts happen through the
-- SECURITY DEFINER award function below, never directly from the client.
drop policy if exists "Owner can read xp_events" on public.xp_events;
create policy "Owner can read xp_events" on public.xp_events
  for select using (auth.uid() = user_id);

grant select on public.xp_events to authenticated;

-- Idempotent badge evaluation from monotonic xp_events aggregates. Permanent:
-- once a badge is inserted it is never removed (ON CONFLICT DO NOTHING).
create or replace function public.evaluate_badges(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
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
      count(*) filter (where type = 'workout') as wk,
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
end;
$$;

-- Award a fixed amount of XP for a (type, ref, day). Idempotent via the unique
-- constraint; keeps profiles.xp in sync and re-evaluates badges on a real award.
create or replace function public.ka_award_xp(
  p_uid uuid, p_type text, p_ref text, p_day date, p_xp integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into xp_events (user_id, type, ref_id, day, xp)
  values (p_uid, p_type, coalesce(p_ref, ''), p_day, p_xp)
  on conflict (user_id, type, ref_id, day) do nothing;
  get diagnostics v_count = row_count;
  if v_count > 0 then
    update profiles set xp = xp + p_xp where id = p_uid;
    perform evaluate_badges(p_uid);
  end if;
end;
$$;

-- Per-source trigger functions (XP amounts live here, server-side).
create or replace function public.ka_xp_habit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.done then
    perform ka_award_xp(NEW.user_id, 'habit', NEW.habit_id::text, NEW.log_date, 10);
  end if;
  return NEW;
end; $$;

create or replace function public.ka_xp_workout() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform ka_award_xp(NEW.user_id, 'workout',
    coalesce(NEW.workout_day_id::text, NEW.id::text), NEW.completed_at::date, 30);
  return NEW;
end; $$;

create or replace function public.ka_xp_journal() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Daily cap: ref_id = '' means at most one journal award per calendar day.
  perform ka_award_xp(NEW.user_id, 'journal', '', NEW.created_at::date, 15);
  return NEW;
end; $$;

create or replace function public.ka_xp_prayer() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform ka_award_xp(NEW.user_id, 'prayer', NEW.id::text, NEW.created_at::date, 10);
  return NEW;
end; $$;

create or replace function public.ka_xp_reading() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.completed_days > 0 then
    perform ka_award_xp(NEW.user_id, 'reading_day',
      NEW.reading_plan_id::text || ':' || NEW.completed_days::text, current_date, 10);
  end if;
  return NEW;
end; $$;

create or replace function public.ka_xp_challenge() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform ka_award_xp(NEW.user_id, 'challenge_join', NEW.challenge_id::text,
    NEW.joined_at::date, 20);
  return NEW;
end; $$;

drop trigger if exists trg_xp_habit on public.habit_logs;
create trigger trg_xp_habit after insert or update on public.habit_logs
  for each row execute function ka_xp_habit();

drop trigger if exists trg_xp_workout on public.workout_logs;
create trigger trg_xp_workout after insert on public.workout_logs
  for each row execute function ka_xp_workout();

drop trigger if exists trg_xp_journal on public.journal_entries;
create trigger trg_xp_journal after insert on public.journal_entries
  for each row execute function ka_xp_journal();

drop trigger if exists trg_xp_prayer on public.prayer_requests;
create trigger trg_xp_prayer after insert on public.prayer_requests
  for each row execute function ka_xp_prayer();

drop trigger if exists trg_xp_reading on public.reading_progress;
create trigger trg_xp_reading after insert or update on public.reading_progress
  for each row execute function ka_xp_reading();

drop trigger if exists trg_xp_challenge on public.challenge_participants;
create trigger trg_xp_challenge after insert on public.challenge_participants
  for each row execute function ka_xp_challenge();

-- Backfill history for existing users (insert-only; safe to re-run).
insert into xp_events (user_id, type, ref_id, day, xp)
select user_id, 'habit', habit_id::text, log_date, 10 from habit_logs where done
on conflict (user_id, type, ref_id, day) do nothing;

insert into xp_events (user_id, type, ref_id, day, xp)
select user_id, 'workout', coalesce(workout_day_id::text, id::text), completed_at::date, 30
from workout_logs
on conflict (user_id, type, ref_id, day) do nothing;

insert into xp_events (user_id, type, ref_id, day, xp)
select distinct user_id, 'journal', '', created_at::date, 15 from journal_entries
on conflict (user_id, type, ref_id, day) do nothing;

insert into xp_events (user_id, type, ref_id, day, xp)
select user_id, 'prayer', id::text, created_at::date, 10 from prayer_requests
on conflict (user_id, type, ref_id, day) do nothing;

insert into xp_events (user_id, type, ref_id, day, xp)
select user_id, 'reading_day', reading_plan_id::text || ':' || gs::text, updated_at::date, 10
from reading_progress, generate_series(1, completed_days) gs
on conflict (user_id, type, ref_id, day) do nothing;

insert into xp_events (user_id, type, ref_id, day, xp)
select user_id, 'challenge_join', challenge_id::text, joined_at::date, 20
from challenge_participants
on conflict (user_id, type, ref_id, day) do nothing;

-- Recompute cached XP from the sum, and evaluate badges for everyone.
update profiles p
set xp = coalesce((select sum(e.xp) from xp_events e where e.user_id = p.id), 0);

do $$
declare r record;
begin
  for r in select id from profiles loop
    perform evaluate_badges(r.id);
  end loop;
end;
$$;
