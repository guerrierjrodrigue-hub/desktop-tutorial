-- 0020_cohorts.sql
-- Group cohorts, invite links and referral tracking.
-- ADDITIVE ONLY: new nullable columns + indexes + one seed cohort. No drops.
-- Existing RLS already covers these:
--   * challenges       — "Public read challenges" (SELECT true) lets /join
--                        resolve a cohort by invite_code; "Users can create
--                        challenges" (INSERT created_by = auth.uid()).
--   * challenge_participants — owner INSERT (user_id = auth.uid()); referred_by
--                        is set by the joining user on their own row.

alter table public.challenges
  add column if not exists start_date date,
  add column if not exists invite_code text;

-- Invite codes are unique when present (one cohort per code; /join/<code>).
create unique index if not exists challenges_invite_code_key
  on public.challenges (invite_code)
  where invite_code is not null;

alter table public.challenge_participants
  add column if not exists referred_by uuid references auth.users(id) on delete set null;

-- Speeds up "how many people has this user referred" counts.
create index if not exists challenge_participants_referred_by_idx
  on public.challenge_participants (referred_by)
  where referred_by is not null;

-- Seed one public cohort so /join/<code> works end-to-end in production.
-- Starts the next Monday; system-owned (created_by NULL). Idempotent on code.
insert into public.challenges
  (title, title_fr, description, description_fr, type, duration_days, metric, start_date, invite_code)
select
  '21-Day Discipline Cohort',
  'Cohorte de 21 jours',
  'Start together and build one daily habit for 21 days.',
  'Commencez ensemble et bâtissez une habitude quotidienne pendant 21 jours.',
  'friends',
  21,
  'habits',
  (current_date + ((8 - extract(isodow from current_date))::int % 7) * interval '1 day')::date,
  'cohort21'
where not exists (select 1 from public.challenges where invite_code = 'cohort21');
