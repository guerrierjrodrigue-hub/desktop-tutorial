-- 0045_feedback_channel.sql
-- Z3 Bloc D: beta feedback channel.
-- Adds public.feedback so signed-in users can send bug reports / ideas during
-- the beta. RLS: a user inserts and reads only their own rows; admins read all.
-- A per-user rate limit (max 5 rows/hour) blocks spam/abuse at the DB level.
-- The message CHECK (5..2000) mirrors the app's zod schema exactly, never
-- stricter than the app (Z3 rule).
--
-- ROLLBACK:
--   drop trigger if exists ka_feedback_rate_limit on public.feedback;
--   drop function if exists public.ka_feedback_rate_limit();
--   drop table if exists public.feedback;   -- destroys submitted feedback

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('bug', 'idee', 'autre')),
  message text not null check (char_length(message) between 5 and 2000),
  page text check (page is null or char_length(page) <= 300),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_created_idx
  on public.feedback (user_id, created_at desc);
create index if not exists feedback_created_idx
  on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- A signed-in user may insert only rows attributed to themselves.
drop policy if exists feedback_insert_own on public.feedback;
create policy feedback_insert_own on public.feedback
  for insert to authenticated
  with check (user_id = auth.uid());

-- A user reads their own feedback; an admin reads everyone's.
drop policy if exists feedback_select_own on public.feedback;
create policy feedback_select_own on public.feedback
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Rate limit: refuse a 6th insert within the trailing hour for one user.
create or replace function public.ka_feedback_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
begin
  select count(*) into recent
  from public.feedback
  where user_id = new.user_id
    and created_at > now() - interval '1 hour';

  if recent >= 5 then
    raise exception 'feedback rate limit exceeded: max 5 per hour'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

-- The trigger function is SECURITY DEFINER; it is only ever called by the
-- trigger below, never directly. Revoke EXECUTE from PUBLIC (anon + any caller)
-- so it is not reachable over PostgREST (same hardening as 0043).
revoke execute on function public.ka_feedback_rate_limit() from public;

drop trigger if exists ka_feedback_rate_limit on public.feedback;
create trigger ka_feedback_rate_limit
  before insert on public.feedback
  for each row execute function public.ka_feedback_rate_limit();

-- VERIFICATION:
--   select relrowsecurity from pg_class where relname = 'feedback';            -- t
--   select polname, cmd from pg_policies where tablename = 'feedback';         -- insert_own, select_own
--   select tgname from pg_trigger where tgrelid = 'public.feedback'::regclass; -- ka_feedback_rate_limit
