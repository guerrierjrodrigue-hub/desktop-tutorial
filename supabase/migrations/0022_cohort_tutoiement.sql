-- 0022_cohort_tutoiement.sql
-- R3: bring the seeded cohort's French description into tutoiement ("tu"), to
-- match the rest of the app's voice. The English column is untouched.
--
-- ADDITIVE ONLY: a single in-place UPDATE of one existing text column. No schema
-- change, no drop, no row deletion. Scoped by invite_code so it only ever touches
-- the one seeded cohort row. Idempotent — re-running is a no-op once applied.

update public.challenges
set description_fr = 'Commence ensemble et bâtis une habitude quotidienne pendant 21 jours.'
where invite_code = 'cohort21'
  and description_fr = 'Commencez ensemble et bâtissez une habitude quotidienne pendant 21 jours.';
