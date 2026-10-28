-- 0038_revoke_internal_function_execute.sql
-- Z1: lock down internal SECURITY DEFINER functions. By default Postgres grants
-- EXECUTE on new functions to PUBLIC, so anon and authenticated could call these
-- privileged helpers directly over PostgREST. They are only meant to run from
-- triggers and other server-side code, so revoke EXECUTE from everyone.
--
-- is_admin() is deliberately left executable: it is referenced by RLS policies,
-- which are evaluated as the calling role, so anon/authenticated must keep it.

revoke execute on function public.evaluate_badges(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.ka_award_xp(uuid, text, text, date, integer) from public, anon, authenticated;
revoke execute on function public.ka_backfill_run_xp_window() from public, anon, authenticated;
revoke execute on function public.ka_backfill_xp_local_day() from public, anon, authenticated;
revoke execute on function public.ka_local_day(timestamptz, uuid) from public, anon, authenticated;
revoke execute on function public.ka_unaward_run_xp() from public, anon, authenticated;
revoke execute on function public.ka_user_tz(uuid) from public, anon, authenticated;
revoke execute on function public.ka_xp_challenge() from public, anon, authenticated;
revoke execute on function public.ka_xp_habit() from public, anon, authenticated;
revoke execute on function public.ka_xp_journal() from public, anon, authenticated;
revoke execute on function public.ka_xp_prayer() from public, anon, authenticated;
revoke execute on function public.ka_xp_reading() from public, anon, authenticated;
revoke execute on function public.ka_xp_run() from public, anon, authenticated;
revoke execute on function public.ka_xp_workout() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.seed_default_habits(uuid) from public, anon, authenticated;
