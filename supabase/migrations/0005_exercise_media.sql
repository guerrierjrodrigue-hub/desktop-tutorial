-- ============================================================================
-- Kingdom Athlete — exercise media
-- Additive only: optional step-by-step instructions and a reference photo per
-- exercise, sourced from the public-domain free-exercise-db (Unlicense) where
-- a confident name match exists. Nothing existing is modified.
-- ============================================================================

alter table exercises
  add column instructions text[] not null default '{}',
  add column image_url text;
