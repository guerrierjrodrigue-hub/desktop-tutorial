-- 0028_xp_local_day.sql
-- U3: xp_events.day must be the user's LOCAL calendar day (profiles.timezone),
-- not UTC. Before this, the award triggers cast timestamptz columns with ::date,
-- which uses the server session's UTC zone, so an event logged at e.g. 23:35
-- Eastern counted for the NEXT day. This redefines the triggers to compute the
-- day in the user's timezone, and backfills existing xp_events.
--
-- ADDITIVE schema-wise: no column is dropped or retyped. The backfill moves the
-- `day` of existing rows to their local day (a data correction, in place) and
-- re-derives the cached profiles.xp and badges from the result.

-- Resolve a user's timezone, defaulting to America/Toronto (matches DEFAULT_TZ
-- in src/lib/date.ts). nullif guards an empty string.
create or replace function public.ka_user_tz(p_uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(nullif((select timezone from profiles where id = p_uid), ''),
                  'America/Toronto');
$$;

-- The local calendar day for an instant in the user's timezone. SQL mirror of
-- getUserToday()/xpEventDay() in src/lib/date.ts; handles DST because
-- `at time zone` resolves the offset at that instant.
create or replace function public.ka_local_day(p_ts timestamptz, p_uid uuid)
returns date language sql stable security definer set search_path = public as $$
  select (p_ts at time zone public.ka_user_tz(p_uid))::date;
$$;

-- Redefine the per-source trigger functions to credit the LOCAL day.
create or replace function public.ka_xp_workout() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform ka_award_xp(NEW.user_id, 'workout',
    coalesce(NEW.workout_day_id::text, NEW.id::text),
    ka_local_day(NEW.completed_at, NEW.user_id), 30);
  return NEW;
end; $$;

create or replace function public.ka_xp_journal() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Daily cap: ref_id = '' means at most one journal award per LOCAL day.
  perform ka_award_xp(NEW.user_id, 'journal', '',
    ka_local_day(NEW.created_at, NEW.user_id), 15);
  return NEW;
end; $$;

create or replace function public.ka_xp_prayer() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform ka_award_xp(NEW.user_id, 'prayer', NEW.id::text,
    ka_local_day(NEW.created_at, NEW.user_id), 10);
  return NEW;
end; $$;

create or replace function public.ka_xp_reading() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.completed_days > 0 then
    perform ka_award_xp(NEW.user_id, 'reading_day',
      NEW.reading_plan_id::text || ':' || NEW.completed_days::text,
      ka_local_day(now(), NEW.user_id), 10);
  end if;
  return NEW;
end; $$;

create or replace function public.ka_xp_challenge() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform ka_award_xp(NEW.user_id, 'challenge_join', NEW.challenge_id::text,
    ka_local_day(NEW.joined_at, NEW.user_id), 20);
  return NEW;
end; $$;

-- habit_logs keep log_date (a plain date chosen by the user) — already local, so
-- ka_xp_habit() is left unchanged.

-- ---- Backfill: move existing xp_events.day to the user's local day ----
-- Packaged as a SECURITY DEFINER function so the whole correction runs
-- server-side under one call. Each event is matched back to its source row by the
-- UTC day it was originally credited on, then moved to the local day in place.
-- The NOT EXISTS guard keeps the unique constraint safe: in the normal one-row-
-- per-event case every row moves; in the rare case where two UTC days collapse
-- into one local day (a daily-capped type near a DST/midnight boundary) the
-- already-filled target is left untouched. Idempotent: safe to re-run.
create or replace function public.ka_backfill_xp_local_day()
returns void language plpgsql security definer set search_path = public as $$
begin
  update xp_events e
     set day = ka_local_day(w.completed_at, w.user_id)
    from workout_logs w
   where e.type = 'workout' and e.user_id = w.user_id
     and e.ref_id = coalesce(w.workout_day_id::text, w.id::text)
     and e.day <> ka_local_day(w.completed_at, w.user_id)
     and not exists (select 1 from xp_events x
                     where x.user_id = e.user_id and x.type = 'workout'
                       and x.ref_id = e.ref_id
                       and x.day = ka_local_day(w.completed_at, w.user_id));

  update xp_events e
     set day = ka_local_day(p.created_at, p.user_id)
    from prayer_requests p
   where e.type = 'prayer' and e.user_id = p.user_id and e.ref_id = p.id::text
     and e.day <> ka_local_day(p.created_at, p.user_id)
     and not exists (select 1 from xp_events x
                     where x.user_id = e.user_id and x.type = 'prayer'
                       and x.ref_id = e.ref_id
                       and x.day = ka_local_day(p.created_at, p.user_id));

  update xp_events e
     set day = ka_local_day(cp.joined_at, cp.user_id)
    from challenge_participants cp
   where e.type = 'challenge_join' and e.user_id = cp.user_id
     and e.ref_id = cp.challenge_id::text
     and e.day <> ka_local_day(cp.joined_at, cp.user_id)
     and not exists (select 1 from xp_events x
                     where x.user_id = e.user_id and x.type = 'challenge_join'
                       and x.ref_id = e.ref_id
                       and x.day = ka_local_day(cp.joined_at, cp.user_id));

  update xp_events e
     set day = ka_local_day(rp.updated_at, rp.user_id)
    from reading_progress rp
   where e.type = 'reading_day' and e.user_id = rp.user_id
     and e.ref_id like rp.reading_plan_id::text || ':%'
     and e.day <> ka_local_day(rp.updated_at, rp.user_id)
     and not exists (select 1 from xp_events x
                     where x.user_id = e.user_id and x.type = 'reading_day'
                       and x.ref_id = e.ref_id
                       and x.day = ka_local_day(rp.updated_at, rp.user_id));

  -- journal rows carry no source ref (daily cap, ref=''); reconnect each to its
  -- entry by the UTC day it was originally credited on (created_at::date).
  update xp_events e
     set day = ka_local_day(j.created_at, j.user_id)
    from journal_entries j
   where e.type = 'journal' and e.user_id = j.user_id and e.ref_id = ''
     and j.created_at::date = e.day
     and e.day <> ka_local_day(j.created_at, j.user_id)
     and not exists (select 1 from xp_events x
                     where x.user_id = e.user_id and x.type = 'journal'
                       and x.ref_id = '' and x.day = ka_local_day(j.created_at, j.user_id));

  -- Re-derive cached XP and badges from the corrected events.
  update profiles pr
     set xp = coalesce((select sum(ev.xp) from xp_events ev
                        where ev.user_id = pr.id), 0);

  perform evaluate_badges(id) from profiles;
end $$;

select public.ka_backfill_xp_local_day();
