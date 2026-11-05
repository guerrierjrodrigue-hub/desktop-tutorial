-- Z3 A3 (D-04, reste) : un membre ne voit plus les publications ni les commentaires
-- des membres qu'il a bloques. user_blocks(blocker_id, blocked_id) : blocker_id a bloque
-- blocked_id. On ajoute a la lecture la condition « l'auteur n'est pas quelqu'un que j'ai
-- bloque ». La lecture reste reservee aux membres connectes (role authenticated).
--
-- Retour arriere :
--   drop policy "Posts are readable by members" on public.community_posts;
--   create policy "Posts are readable by members" on public.community_posts
--     for select to authenticated using (true);
--   drop policy "Comments are readable by members" on public.post_comments;
--   create policy "Comments are readable by members" on public.post_comments
--     for select to authenticated using (true);

drop policy if exists "Posts are readable by members" on public.community_posts;
create policy "Posts are readable by members" on public.community_posts
  for select to authenticated using (
    not exists (
      select 1 from public.user_blocks ub
      where ub.blocker_id = auth.uid() and ub.blocked_id = community_posts.user_id
    )
  );

drop policy if exists "Comments are readable by members" on public.post_comments;
create policy "Comments are readable by members" on public.post_comments
  for select to authenticated using (
    not exists (
      select 1 from public.user_blocks ub
      where ub.blocker_id = auth.uid() and ub.blocked_id = post_comments.user_id
    )
  );
