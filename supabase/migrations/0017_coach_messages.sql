-- 0017: Persistent coach conversation history (memory) + basis for a durable
-- per-user daily rate limit. Additive. Owner-only RLS; cascades on account
-- deletion so Loi 25 erasure stays complete.

create table if not exists coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  coach_id text not null default 'barnabas',
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tokens integer,
  created_at timestamptz not null default now()
);

alter table coach_messages enable row level security;

create policy "Owner can read coach_messages"
  on coach_messages for select using (auth.uid() = user_id);
create policy "Owner can insert coach_messages"
  on coach_messages for insert with check (auth.uid() = user_id);
create policy "Owner can delete coach_messages"
  on coach_messages for delete using (auth.uid() = user_id);

create index if not exists coach_messages_user_created_idx
  on coach_messages (user_id, created_at);
