-- 0037_run_xp_date_window.sql
-- Y4: a run earns XP only when it is dated today or yesterday (user timezone),
-- never for an older or future date. Also allow the "import" source for GPX,
-- and take back XP already granted to back-dated runs outside the window.

-- Allow GPX imports to mark their source.
alter table public.runs drop constraint if exists runs_source_check;
alter table public.runs
  add constraint runs_source_check check (source in ('manual', 'chrono', 'import'));

-- Redefine the run XP trigger: genuine effort (>= 10 min and >= 1 km) AND the
-- run's date within [today-1, today] in the user's timezone. ref_id = '' keeps
-- the award a once-per-day cap. Fires on insert only, so editing a run's date
-- never creates XP.
create or replace function public.ka_xp_run() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_today date;
begin
  v_today := ka_local_day(now(), NEW.user_id);
  if coalesce(NEW.duration_s, 0) >= 600
     and coalesce(NEW.distance_m, 0) >= 1000
     and NEW.ran_on <= v_today
     and NEW.ran_on >= v_today - 1 then
    perform ka_award_xp(NEW.user_id, 'run', '', NEW.ran_on, 30);
  end if;
  return NEW;
end; $$;

-- One-off correction: remove run XP that was granted to a back-dated run whose
-- date fell outside the [created_day-1, created_day] window at the time it was
-- logged. A day's award is removed only when no genuine, in-window run remains
-- for that day; profiles.xp is decremented by exactly what was taken back.
create or replace function public.ka_backfill_run_xp_window() returns void
language plpgsql security definer set search_path = public as $$
declare r record; v_xp integer;
begin
  for r in
    select e.user_id, e.day
    from xp_events e
    where e.type = 'run' and e.ref_id = ''
  loop
    if not exists (
      select 1 from runs x
      where x.user_id = r.user_id
        and x.ran_on = r.day
        and x.duration_s >= 600
        and x.distance_m >= 1000
        and x.ran_on <= ka_local_day(x.created_at, x.user_id)
        and x.ran_on >= ka_local_day(x.created_at, x.user_id) - 1
    ) then
      delete from xp_events
       where user_id = r.user_id and type = 'run' and ref_id = '' and day = r.day
       returning xp into v_xp;
      if found then
        update profiles set xp = greatest(0, xp - v_xp) where id = r.user_id;
      end if;
    end if;
  end loop;
end; $$;

select public.ka_backfill_run_xp_window();
