-- 0011: Per-user mastery for the curated memory verses.
--
-- Additive only. Before this, memory-verse "mastery" was faked from static data
-- (90%/60%/30%) and shown to every user, including brand-new accounts. The
-- curated verse list itself lives in app data (src/data/spiritual.ts, with the
-- French LSG text); this table stores each user's own progress against it,
-- keyed by a stable verse key. A new user has no rows here, so they correctly
-- see 0% everywhere. Owner-only RLS, matching the other user-owned tables.

create table if not exists memory_verse_progress (
  user_id uuid not null references profiles (id) on delete cascade,
  verse_key text not null,
  mastery numeric(3, 2) not null default 0 check (mastery between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, verse_key)
);

alter table memory_verse_progress enable row level security;

create policy "Owner can read memory_verse_progress"
  on memory_verse_progress for select
  using (auth.uid() = user_id);
create policy "Owner can insert memory_verse_progress"
  on memory_verse_progress for insert
  with check (auth.uid() = user_id);
create policy "Owner can update memory_verse_progress"
  on memory_verse_progress for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can delete memory_verse_progress"
  on memory_verse_progress for delete
  using (auth.uid() = user_id);
