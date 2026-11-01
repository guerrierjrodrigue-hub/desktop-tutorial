-- Z2.4 : la série (streak) n'est plus réécrite par la session de l'utilisateur.
-- Une fonction SECURITY DEFINER la recalcule depuis xp_events et l'écrit, puis
-- le privilège UPDATE sur la colonne streak est retiré au rôle authenticated.
--
-- Le calcul reproduit globalStreak (src/lib/gamification.ts) :
--   - jours d'entraînement repartis comme spreadTrainingDays(training_days || 3) ;
--   - un jour de repos planifie ne casse pas la serie ;
--   - on marche en arriere depuis aujourd'hui (fuseau de l'utilisateur).
-- Retour en arriere : grant update (streak) on public.profiles to authenticated;
--                     drop function public.ka_refresh_streak();

create or replace function public.ka_refresh_streak()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_days int;
  v_today date;
  v_count int;
  v_train int[] := array[]::int[];
  v_event_days date[];
  v_cursor date;
  v_streak int := 0;
  v_i int;
  v_widx int;
  v_is_rest boolean;
  v_has_event boolean;
begin
  if v_uid is null then
    return 0;
  end if;

  select coalesce(nullif(training_days, 0), 3)
    into v_days
  from profiles where id = v_uid;
  if not found then
    return 0;
  end if;

  -- Today in the user's local timezone (shared helper used by the XP triggers).
  v_today := ka_local_day(now(), v_uid);

  -- Training-day pattern: the "train" weekday indices (Monday = 0) are
  -- { floor(k * 7 / count) : k in 0..count-1 }. Any index not in the set is rest.
  v_count := greatest(0, least(7, round(v_days)));
  if v_count > 0 then
    for v_i in 0..(v_count - 1) loop
      v_train := v_train || (floor(v_i * 7.0 / v_count))::int;
    end loop;
  end if;

  -- Distinct days with at least one XP event, bounded to the last ~200 days.
  select coalesce(array_agg(distinct day), array[]::date[])
    into v_event_days
  from xp_events
  where user_id = v_uid and day >= v_today - 200 and day <= v_today;

  -- Monday-based weekday index of a date: (dow + 6) % 7, with dow 0 = Sunday.
  -- is_rest(date) := that index is NOT one of the training indices.
  v_cursor := v_today;
  v_widx := (extract(dow from v_cursor)::int + 6) % 7;
  v_is_rest := not (v_widx = any(v_train));
  -- Today not done and not a rest day: the streak can still stand on prior days.
  if not (v_cursor = any(v_event_days)) and not v_is_rest then
    v_cursor := v_cursor - 1;
  end if;

  -- Bounded backward walk (same 400-day cap as computeStreak).
  for v_i in 0..399 loop
    v_has_event := v_cursor = any(v_event_days);
    v_widx := (extract(dow from v_cursor)::int + 6) % 7;
    v_is_rest := not (v_widx = any(v_train));
    if v_has_event then
      v_streak := v_streak + 1;
    elsif not v_is_rest then
      exit; -- a real missed day ends the streak
    end if;
    -- rest day with no event: skip without counting or breaking
    v_cursor := v_cursor - 1;
  end loop;

  update profiles set streak = v_streak
  where id = v_uid and streak is distinct from v_streak;

  return v_streak;
end;
$$;

-- The caller may refresh only their own streak (auth.uid()), so anon has no
-- business calling it: take EXECUTE from public (and thus anon), then grant it
-- back to signed-in users only.
revoke execute on function public.ka_refresh_streak() from public;
grant execute on function public.ka_refresh_streak() to authenticated;

-- D-01 (suite) : streak n'est plus modifiable directement par le rôle authenticated.
revoke update (streak) on public.profiles from authenticated;
