-- 0046_daily_limits.sql
-- Z3 Bloc E1: fair-play limits for the beta.
--   1. A daily GLOBAL XP cap (200/day) so XP can't be farmed without bound.
--   2. Per-user creation limits: 30 habits total, 10 prayer requests/day,
--      20 community posts/day. Enforced at the DB so they hold regardless of
--      the client. (Runs already cap at 5/day in the app.)
--
-- The XP cap lives inside ka_award_xp (SECURITY DEFINER, already EXECUTE-revoked
-- in 0038 — create-or-replace preserves that grant). The creation limits are
-- plain (invoker-rights) BEFORE INSERT triggers: each only counts the caller's
-- own rows (new.user_id = auth.uid() via the insert policies), which RLS allows.
--
-- ROLLBACK:
--   drop trigger if exists ka_limit_habits on public.habits;
--   drop trigger if exists ka_limit_prayers_per_day on public.prayer_requests;
--   drop trigger if exists ka_limit_posts_per_day on public.community_posts;
--   drop function if exists public.ka_limit_habits();
--   drop function if exists public.ka_limit_prayers_per_day();
--   drop function if exists public.ka_limit_posts_per_day();
--   -- and re-apply the 0024 definition of ka_award_xp (without the daily cap).

-- 1. Daily global XP cap -----------------------------------------------------
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
  v_today integer;
  v_grant integer;
begin
  -- Never award more than 200 XP across all sources in one day (Z3 E1).
  select coalesce(sum(xp), 0) into v_today
    from xp_events where user_id = p_uid and day = p_day;
  v_grant := least(p_xp, greatest(0, 200 - v_today));

  -- The unique (user_id, type, ref_id, day) still dedups a repeated source.
  insert into xp_events (user_id, type, ref_id, day, xp)
  values (p_uid, p_type, coalesce(p_ref, ''), p_day, v_grant)
  on conflict (user_id, type, ref_id, day) do nothing;
  get diagnostics v_count = row_count;
  if v_count > 0 and v_grant > 0 then
    update profiles set xp = xp + v_grant where id = p_uid;
    perform evaluate_badges(p_uid);
  end if;
end;
$$;

-- 2a. Habits: at most 30 per user -------------------------------------------
create or replace function public.ka_limit_habits()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.habits where user_id = new.user_id) >= 30 then
    raise exception 'habit limit reached: max 30 per user'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists ka_limit_habits on public.habits;
create trigger ka_limit_habits
  before insert on public.habits
  for each row execute function public.ka_limit_habits();

-- 2b. Prayer requests: at most 10 per day -----------------------------------
create or replace function public.ka_limit_prayers_per_day()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.prayer_requests
      where user_id = new.user_id and created_at::date = (now())::date) >= 10 then
    raise exception 'prayer request limit reached: max 10 per day'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists ka_limit_prayers_per_day on public.prayer_requests;
create trigger ka_limit_prayers_per_day
  before insert on public.prayer_requests
  for each row execute function public.ka_limit_prayers_per_day();

-- 2c. Community posts: at most 20 per day -----------------------------------
create or replace function public.ka_limit_posts_per_day()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.community_posts
      where user_id = new.user_id and created_at::date = (now())::date) >= 20 then
    raise exception 'post limit reached: max 20 per day'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists ka_limit_posts_per_day on public.community_posts;
create trigger ka_limit_posts_per_day
  before insert on public.community_posts
  for each row execute function public.ka_limit_posts_per_day();

-- VERIFICATION:
--   select tgname from pg_trigger where tgrelid in
--     ('public.habits'::regclass,'public.prayer_requests'::regclass,
--      'public.community_posts'::regclass) and not tgisinternal;
--   -- expect ka_limit_habits, ka_limit_prayers_per_day, ka_limit_posts_per_day
--   select prosecdef from pg_proc where proname = 'ka_award_xp';   -- t (cap lives here)
