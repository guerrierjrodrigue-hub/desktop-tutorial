-- Correctif D-01 : un utilisateur connecté ne peut plus modifier ses propres droits.
-- Seules les colonnes de profil que l'application écrit avec la session de l'utilisateur restent modifiables.
-- Protégées (modifiables seulement par le compte de service ou les fonctions de la base) :
--   id, email, is_admin, is_premium, xp, joined_at, updated_at,
--   stripe_customer_id, stripe_subscription_id, subscription_price_id, subscription_status, current_period_end.
-- Résiduel connu : streak reste modifiable (écrite par l'application avec la session de l'utilisateur).
-- Retour en arrière : grant insert, update, delete on public.profiles to anon, authenticated;
revoke insert, update, delete on public.profiles from public, anon, authenticated;
grant update (
  name, avatar_url, bio, birth_date, church, gender, goal, height_cm, weight_kg,
  equipment, favorite_verse, training_days, primary_goal, primary_goals, primary_activity,
  reminder_time, timezone, show_on_leaderboard, run_level, run_goal_kind, onboarded_at,
  identities, level, streak
) on public.profiles to authenticated;
