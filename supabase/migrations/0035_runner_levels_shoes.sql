-- 0035_runner_levels_shoes.sql
-- Y3 schema (additive): runner experience + goal kind on the profile, a shoe
-- wear table (owner-only), and an optional shoe link on runs. No destructive
-- statements except the policies this feature needs.

-- Runner onboarding answers (nullable until the user completes the 2 questions).
alter table public.profiles
  add column if not exists run_level text,
  add column if not exists run_goal_kind text;

alter table public.profiles
  add constraint profiles_run_level_check
  check (run_level is null or run_level in ('new', '5k', '10k')) not valid;

alter table public.profiles
  add constraint profiles_run_goal_kind_check
  check (run_goal_kind is null or run_goal_kind in ('5k', '10k', 'half', 'free')) not valid;

-- Shoe wear: cumulative kilometres per pair (owner-only), alert handled in the UI.
create table if not exists public.run_shoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  distance_m integer not null default 0 check (distance_m >= 0),
  retired boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists run_shoes_user_idx on public.run_shoes (user_id);

-- Optional shoe link on a run (set null if the shoe is removed).
alter table public.runs
  add column if not exists shoe_id uuid references public.run_shoes(id) on delete set null;

alter table public.run_shoes enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='run_shoes' and policyname='Owner read run_shoes') then
    create policy "Owner read run_shoes" on public.run_shoes for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='run_shoes' and policyname='Owner insert run_shoes') then
    create policy "Owner insert run_shoes" on public.run_shoes for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='run_shoes' and policyname='Owner update run_shoes') then
    create policy "Owner update run_shoes" on public.run_shoes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='run_shoes' and policyname='Owner remove run_shoes') then
    create policy "Owner remove run_shoes" on public.run_shoes for delete using (auth.uid() = user_id);
  end if;
end $$;

grant select, insert, update, delete on public.run_shoes to authenticated;
