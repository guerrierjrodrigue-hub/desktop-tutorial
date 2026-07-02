-- ============================================================================
-- Kingdom Athlete — Row Level Security policies
--
-- Model:
--   * Catalog tables (programs, exercises, badges, verses, recipes, …) are
--     readable by everyone; writes are admin-only (service role bypasses RLS).
--   * User-owned tables are fully private to their owner (user_id = auth.uid()).
--   * Community content is readable by all; each user manages only their rows.
-- ============================================================================

-- Admin check used by catalog write policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Reusable macro-ish pattern is not available; policies are spelled out below.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Catalog tables: public read, admin write
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'programs', 'program_weeks', 'workout_days', 'exercises',
    'badges', 'challenges', 'verses', 'devotionals',
    'reading_plans', 'recipes', 'groups'
  ]
  loop
    execute format(
      'create policy "Public read %1$s" on %1$s for select using (true);', t
    );
    execute format(
      'create policy "Admin write %1$s" on %1$s for all
         using (public.is_admin()) with check (public.is_admin());', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- User-owned tables: owner-only CRUD
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'program_enrollments', 'workout_logs', 'habits', 'habit_logs',
    'daily_stats', 'user_badges', 'challenge_participants',
    'reading_progress', 'memory_verses', 'prayer_requests',
    'food_logs', 'group_members'
  ]
  loop
    execute format(
      'create policy "Owner can read %1$s" on %1$s for select
         using (auth.uid() = user_id);', t
    );
    execute format(
      'create policy "Owner can insert %1$s" on %1$s for insert
         with check (auth.uid() = user_id);', t
    );
    execute format(
      'create policy "Owner can update %1$s" on %1$s for update
         using (auth.uid() = user_id) with check (auth.uid() = user_id);', t
    );
    execute format(
      'create policy "Owner can delete %1$s" on %1$s for delete
         using (auth.uid() = user_id);', t
    );
  end loop;
end $$;

-- Challenge participation and group membership are readable by everyone so
-- leaderboards and member counts work (they are not sensitive).
create policy "Challenge participation is public read"
  on challenge_participants for select using (true);
create policy "Group membership is public read"
  on group_members for select using (true);

-- ---------------------------------------------------------------------------
-- Community: posts, likes, comments  (public read; owner writes)
-- ---------------------------------------------------------------------------
create policy "Posts are public read"
  on community_posts for select using (true);
create policy "Users can create their own posts"
  on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts"
  on community_posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own posts"
  on community_posts for delete using (auth.uid() = user_id);

create policy "Likes are public read"
  on post_likes for select using (true);
create policy "Users can like as themselves"
  on post_likes for insert with check (auth.uid() = user_id);
create policy "Users can remove their own like"
  on post_likes for delete using (auth.uid() = user_id);

create policy "Comments are public read"
  on post_comments for select using (true);
create policy "Users can comment as themselves"
  on post_comments for insert with check (auth.uid() = user_id);
create policy "Users can update their own comment"
  on post_comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own comment"
  on post_comments for delete using (auth.uid() = user_id);
