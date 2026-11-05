-- Z3 A2 : ka_refresh_streak() ne doit pas etre appelable par un visiteur anonyme.
-- Elle recalcule la serie du compte connecte (auth.uid()) et n'a aucun sens pour anon.
-- On retire EXECUTE a public et anon, et on le garde pour authenticated (deja accorde
-- en 0042 ; re-accorde ici par securite, idempotent).
--
-- is_admin() : LAISSEE executable par anon, volontairement. Toutes les politiques RLS
-- qui l'utilisent ciblent le role "public" (donc aussi anon), pas "authenticated" :
--   select tablename, policyname, roles from pg_policies
--   where qual ilike '%is_admin%' or with_check ilike '%is_admin%';
-- -> 18 politiques, toutes {public} (badges, challenges, programs, recipes, verses,
--    content_reports, community_posts, post_comments, ...). Si on retirait EXECUTE de
--    is_admin() a anon, toute requete anonyme sur ces tables echouerait avec
--    « permission denied for function is_admin ». On la laisse donc en place ; is_admin()
--    renvoie deja false pour anon, donc aucun privilege admin n'est accorde.
--
-- Retour arriere : grant execute on function public.ka_refresh_streak() to anon;
revoke execute on function public.ka_refresh_streak() from public, anon;
grant execute on function public.ka_refresh_streak() to authenticated;
