-- 0019_bible_marks.sql
-- Per-verse bookmarks and highlights for the Bible reader.
-- ADDITIVE ONLY: a new owner-scoped table. No drops, no data loss.

create table if not exists public.bible_marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  translation text not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  kind text not null check (kind in ('bookmark', 'highlight')),
  color text,
  created_at timestamptz not null default now(),
  -- One mark of each kind per verse per user (toggle on/off).
  unique (user_id, translation, book, chapter, verse, kind)
);

alter table public.bible_marks enable row level security;

-- Owner-only access (mirrors the other per-user tables).
create policy "Owner can read bible_marks"
  on public.bible_marks for select using (auth.uid() = user_id);
create policy "Owner can insert bible_marks"
  on public.bible_marks for insert with check (auth.uid() = user_id);
create policy "Owner can update bible_marks"
  on public.bible_marks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can delete bible_marks"
  on public.bible_marks for delete using (auth.uid() = user_id);

-- Fast "marks for the open chapter" lookups.
create index if not exists bible_marks_lookup_idx
  on public.bible_marks (user_id, translation, book, chapter);
