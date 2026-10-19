-- 0029_recipe_details.sql
-- U5: recipe detail pages need ingredients, steps, and a photo. This adds the
-- columns to hold them. The catalog stores only names + macros, so the app fills
-- these in with ESTIMATED, bilingual content derived deterministically from each
-- recipe's name, category and macros (src/lib/recipe-details.ts) whenever a row's
-- columns are empty — and the UI labels it as an estimation. Storing real,
-- hand-written content in these columns later will transparently override the
-- estimate. ADDITIVE: only new, nullable/defaulted columns.

alter table public.recipes add column if not exists ingredients text[] not null default '{}';
alter table public.recipes add column if not exists ingredients_fr text[] not null default '{}';
alter table public.recipes add column if not exists steps text[] not null default '{}';
alter table public.recipes add column if not exists steps_fr text[] not null default '{}';
alter table public.recipes add column if not exists image_url text;
