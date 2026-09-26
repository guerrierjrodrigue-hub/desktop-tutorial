-- ============================================================================
-- Kingdom Athlete — profiles privacy fix
-- Before this, "Profiles are viewable by authenticated users" let ANY signed-in
-- user read EVERY column of EVERY profile (email, birth_date, weight_kg,
-- height_cm, gender) straight from the API. This locks the profiles table to
-- owner-only reads and exposes only a safe, public subset through a view.
-- ============================================================================

-- 1. Remove the over-broad read policy.
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;

-- 2. Direct profile reads are now owner-only (PII stays private).
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 3. Public, non-sensitive subset for cross-user features (leaderboard,
--    community author names).
--
--    IMPORTANT — this is intentionally a SECURITY DEFINER view (security_invoker
--    is NOT set to true). With the owner-only RLS from step 2, a
--    `security_invoker = true` view would return only the *caller's own* row,
--    which would break the leaderboard and community feed (they must read other
--    users' public info). A definer view runs with the owner's rights and so
--    returns every row — but it exposes ONLY these six non-sensitive columns.
--    email, birth_date, weight_kg, height_cm and gender are never selected, so
--    no private data can leak through it.
create or replace view public.profile_public
  with (security_invoker = false, security_barrier = true) as
  select id, name, avatar_url, level, xp, streak
  from public.profiles;

-- 4. Expose only the safe view to the API roles, READ-ONLY. A simple definer
--    view is auto-updatable, so leaving the default INSERT/UPDATE/DELETE grants
--    in place would let API roles write through it and bypass profiles' RLS.
revoke all on public.profile_public from authenticated, anon;
grant select on public.profile_public to authenticated, anon;
