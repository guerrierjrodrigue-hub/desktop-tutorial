-- ============================================================================
-- Kingdom Athlete — personal transformation platform (Milestone 1)
-- Additive only: onboarding identities/goal on profiles, per-user preferences
-- (active coach, dashboard layout), and a generic journal for non-faith
-- Purpose-pillar users. No existing column or table is modified.
-- ============================================================================

alter table profiles
  add column primary_goal text,
  add column identities text[] not null default '{}',
  add column onboarded_at timestamptz;

create table user_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  active_coach text not null default 'barnabas',
  dashboard_layout jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function set_updated_at();

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);
create index idx_journal_entries_user on journal_entries (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — owner-only, matching the pattern in 0002_rls_policies.sql
-- ---------------------------------------------------------------------------
alter table user_preferences enable row level security;
create policy "Owner can read own preferences"
  on user_preferences for select using (auth.uid() = user_id);
create policy "Owner can insert own preferences"
  on user_preferences for insert with check (auth.uid() = user_id);
create policy "Owner can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table journal_entries enable row level security;
create policy "Owner can read journal_entries"
  on journal_entries for select using (auth.uid() = user_id);
create policy "Owner can insert journal_entries"
  on journal_entries for insert with check (auth.uid() = user_id);
create policy "Owner can update journal_entries"
  on journal_entries for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can delete journal_entries"
  on journal_entries for delete using (auth.uid() = user_id);
