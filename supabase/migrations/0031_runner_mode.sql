-- 0031_runner_mode.sql
-- Y1: Runner mode, step 1 (no GPS, no AI). ADDITIVE ONLY: new nullable column
-- on profiles, four new tables, owner-only / public-read RLS, and one XP trigger
-- that mirrors the W1 anti-farm rules. No column is dropped or retyped, no row
-- deleted. Kept free of DROP / DELETE statements so it applies cleanly.
--
-- Tables:
--   runs             - a logged run (owner-only). pace_s_per_km is a GENERATED
--                      column so it is always consistent with distance/duration.
--   run_plans        - training plans in weeks (public read). weeks_meta holds
--                      the per-week verse + prayer (fr/en) as JSON.
--   run_plan_sessions- the sessions of a plan; segments is a JSON array of
--                      { kind, seconds } run/walk/warmup/cooldown blocks (fr/en
--                      titles live on the row).
--   run_goals        - a user's target distance / race date / target time.

-- 1) Primary activity on the profile (strength | running | both).
alter table public.profiles
  add column if not exists primary_activity text;

alter table public.profiles
  add constraint profiles_primary_activity_check
  check (primary_activity is null
         or primary_activity in ('strength', 'running', 'both')) not valid;

-- 2) Content tables (public read, admin write).
create table if not exists public.run_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_fr text,
  description text,
  description_fr text,
  weeks smallint not null,
  goal_distance_m integer,
  -- Per-week verse + prayer, fr/en. Array of
  -- { week, verse_ref, verse_text, verse_ref_en, verse_text_en, prayer, prayer_en }.
  weeks_meta jsonb not null default '[]'::jsonb,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.run_plan_sessions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.run_plans(id) on delete cascade,
  week smallint not null,
  day_in_week smallint not null,
  title text not null,
  title_fr text,
  -- Array of { kind: 'warmup'|'run'|'walk'|'cooldown', seconds: int }.
  segments jsonb not null default '[]'::jsonb,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists run_plan_sessions_plan_idx
  on public.run_plan_sessions (plan_id, week, day_in_week);

-- 3) Owner tables.
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ran_on date not null,
  distance_m integer not null check (distance_m > 0 and distance_m <= 100000),
  duration_s integer not null check (duration_s > 0),
  -- Seconds per kilometre, computed from distance + duration and kept in sync.
  pace_s_per_km integer generated always as (
    case when distance_m > 0
      then round((duration_s::numeric * 1000) / distance_m)::int
      else 0 end
  ) stored,
  kind text not null default 'easy'
    check (kind in ('easy', 'tempo', 'intervals', 'long', 'race')),
  effort smallint check (effort is null or (effort >= 1 and effort <= 10)),
  note text,
  source text not null default 'manual' check (source in ('manual', 'chrono')),
  plan_session_id uuid references public.run_plan_sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists runs_user_day_idx on public.runs (user_id, ran_on);

create table if not exists public.run_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_distance_m integer not null check (target_distance_m > 0),
  race_date date,
  target_time_s integer check (target_time_s is null or target_time_s > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists run_goals_user_idx on public.run_goals (user_id);

-- 4) RLS. Content tables are public read + admin write; owner tables are
-- private to their owner. Guarded so a re-apply does not error (no DROP needed).
alter table public.run_plans enable row level security;
alter table public.run_plan_sessions enable row level security;
alter table public.runs enable row level security;
alter table public.run_goals enable row level security;

do $$
declare t text;
begin
  -- Public-read content tables.
  foreach t in array array['run_plans', 'run_plan_sessions'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public'
                   and tablename = t and policyname = 'Public read ' || t) then
      execute format('create policy "Public read %1$s" on public.%1$s for select using (true);', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public'
                   and tablename = t and policyname = 'Admin write ' || t) then
      execute format('create policy "Admin write %1$s" on public.%1$s for all using (public.is_admin()) with check (public.is_admin());', t);
    end if;
  end loop;

  -- Owner tables: read / insert / update by the owner. (No row removal is part
  -- of runner mode step 1, so no destructive policy is defined here.)
  foreach t in array array['runs', 'run_goals'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public'
                   and tablename = t and policyname = 'Owner read ' || t) then
      execute format('create policy "Owner read %1$s" on public.%1$s for select using (auth.uid() = user_id);', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public'
                   and tablename = t and policyname = 'Owner insert ' || t) then
      execute format('create policy "Owner insert %1$s" on public.%1$s for insert with check (auth.uid() = user_id);', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public'
                   and tablename = t and policyname = 'Owner update ' || t) then
      execute format('create policy "Owner update %1$s" on public.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    end if;
  end loop;
end $$;

grant select, insert, update on public.runs to authenticated;
grant select, insert, update on public.run_goals to authenticated;
grant select on public.run_plans to authenticated;
grant select on public.run_plan_sessions to authenticated;

-- 5) XP for a run, with the same anti-farm rules as workouts (W1): a run earns
-- XP only when it is genuine (at least 10 minutes AND at least 1 km), and at
-- most once per LOCAL day per user. The day is the run's own date (ran_on),
-- which the client records in the user's timezone. ref_id = '' makes the award
-- a hard once-per-day cap, so logging several runs for one day pays once.
create or replace function public.ka_xp_run() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(NEW.duration_s, 0) >= 600 and coalesce(NEW.distance_m, 0) >= 1000 then
    perform ka_award_xp(NEW.user_id, 'run', '', NEW.ran_on, 30);
  end if;
  return NEW;
end; $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_xp_run') then
    create trigger trg_xp_run after insert on public.runs
      for each row execute function public.ka_xp_run();
  end if;
end $$;
