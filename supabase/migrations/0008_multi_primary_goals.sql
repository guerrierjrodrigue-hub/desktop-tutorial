-- ============================================================================
-- Kingdom Athlete — multiple primary goals
-- Onboarding now lets users pick several goals instead of just one. Additive:
-- the old `primary_goal` column is left in place, unused going forward.
-- ============================================================================

alter table profiles add column primary_goals text[] not null default '{}';
