-- 0033_run_fixes.sql
-- Y2 schema changes (additive): per-session instructions, owner delete on runs,
-- and an XP rollback when a deleted run was the day's only qualifying one. Kept
-- free of destructive statements except the policy/trigger this feature needs.

-- Y2.5: distinct instructions per session.
alter table public.run_plan_sessions
  add column if not exists instructions text,
  add column if not exists instructions_fr text;

-- Y2.3: the owner may remove their own runs.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
                 and tablename = 'runs' and policyname = 'Owner delete runs') then
    create policy "Owner delete runs" on public.runs
      for delete using (auth.uid() = user_id);
  end if;
end $$;

grant delete on public.runs to authenticated;

-- Y2.3: when a qualifying run is removed and it was the last qualifying run of
-- its day, take back that day's run XP (mirror of the ka_xp_run award). Removes
-- the xp_event and decrements the cached profiles.xp by exactly what was granted.
create or replace function public.ka_unaward_run_xp() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_xp integer;
begin
  if coalesce(OLD.duration_s, 0) >= 600 and coalesce(OLD.distance_m, 0) >= 1000 then
    if not exists (
      select 1 from runs r
      where r.user_id = OLD.user_id and r.ran_on = OLD.ran_on and r.id <> OLD.id
        and r.duration_s >= 600 and r.distance_m >= 1000
    ) then
      delete from xp_events
       where user_id = OLD.user_id and type = 'run' and ref_id = '' and day = OLD.ran_on
       returning xp into v_xp;
      if found then
        update profiles set xp = greatest(0, xp - v_xp) where id = OLD.user_id;
      end if;
    end if;
  end if;
  return OLD;
end; $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_xp_run_delete') then
    create trigger trg_xp_run_delete after delete on public.runs
      for each row execute function public.ka_unaward_run_xp();
  end if;
end $$;
