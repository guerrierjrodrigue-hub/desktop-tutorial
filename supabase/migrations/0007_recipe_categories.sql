-- ============================================================================
-- Kingdom Athlete — recipe categories
-- Additive: a single primary category per recipe (weight-loss, muscle-gain,
-- fasting, breakfast, quick-easy) so the Nutrition page can filter like the
-- Fitness page already does by program category. `tags` stays as-is for
-- secondary free-form labels.
-- ============================================================================

alter table recipes add column category text;
create index idx_recipes_category on recipes (category);
