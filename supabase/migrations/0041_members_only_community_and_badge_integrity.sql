-- D-04 : le contenu publié par les membres n'est lisible que par les membres connectés.
-- Retour en arrière : recréer chaque politique avec "to public using (true)".
drop policy if exists "Posts are public read" on public.community_posts;
create policy "Posts are readable by members" on public.community_posts
  for select to authenticated using (true);

drop policy if exists "Comments are public read" on public.post_comments;
create policy "Comments are readable by members" on public.post_comments
  for select to authenticated using (true);

drop policy if exists "Likes are public read" on public.post_likes;
create policy "Likes are readable by members" on public.post_likes
  for select to authenticated using (true);

drop policy if exists "Group membership is public read" on public.group_members;
create policy "Group membership is readable by members" on public.group_members
  for select to authenticated using (true);

drop policy if exists "Challenge participation is public read" on public.challenge_participants;
create policy "Challenge participation is readable by members" on public.challenge_participants
  for select to authenticated using (true);

-- D-10 (partiel) : les badges sont attribués uniquement par evaluate_badges (SECURITY DEFINER).
-- Un utilisateur ne peut plus s'attribuer, modifier ou retirer un badge.
drop policy if exists "Owner can insert user_badges" on public.user_badges;
drop policy if exists "Owner can update user_badges" on public.user_badges;
drop policy if exists "Owner can delete user_badges" on public.user_badges;

-- D-21 (partiel) : index manquants sur des clés étrangères.
create index if not exists idx_content_reports_comment_id on public.content_reports (comment_id);
create index if not exists idx_content_reports_post_id on public.content_reports (post_id);
create index if not exists idx_runs_plan_session_id on public.runs (plan_session_id);
create index if not exists idx_runs_shoe_id on public.runs (shoe_id);
create index if not exists idx_user_blocks_blocked_id on public.user_blocks (blocked_id);
