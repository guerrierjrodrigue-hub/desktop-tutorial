-- 0047_data_check_constraints.sql
-- Z3 Bloc E2: bound stored values with CHECK constraints so malformed or
-- abusive data can't reach the database, even if a client skips validation.
-- Every bound here is EQUAL TO OR LOOSER THAN the app's zod schema, never
-- stricter (Z3 rule). Verified against existing rows first (all tables empty
-- or well within bounds at migration time).
--
--   runs.pace_s_per_km  90..1800 s/km  (app band is 150..900 -> DB is looser)
--   food_logs.calories  0..10000       (app zod lowered to match in this block)
--   food_logs.*_g       0..1000        (protein/carbs/fat; app zod matches)
--   food_logs.name      <= 120         (= app)
--   journal_entries     title<=200, body<=10000   (= app)
--   habits.label        <= 80          (= app)
--
-- (community_posts.content<=1000 and post_comments.body<=500 are already
--  constrained by 0026_community_moderation, so they are not repeated here.)
--
-- ROLLBACK:
--   alter table public.runs            drop constraint if exists runs_pace_band;
--   alter table public.food_logs       drop constraint if exists food_logs_calories_range;
--   alter table public.food_logs       drop constraint if exists food_logs_protein_range;
--   alter table public.food_logs       drop constraint if exists food_logs_carbs_range;
--   alter table public.food_logs       drop constraint if exists food_logs_fat_range;
--   alter table public.food_logs       drop constraint if exists food_logs_name_len;
--   alter table public.journal_entries drop constraint if exists journal_title_len;
--   alter table public.journal_entries drop constraint if exists journal_body_len;
--   alter table public.habits          drop constraint if exists habits_label_len;

-- Runs: pace band (distance_m>0 and duration_s>0 already constrained in 0031).
alter table public.runs
  add constraint runs_pace_band check (pace_s_per_km between 90 and 1800);

-- Food logs: sane calorie/macro ranges + name length.
alter table public.food_logs
  add constraint food_logs_calories_range check (calories between 0 and 10000);
alter table public.food_logs
  add constraint food_logs_protein_range check (protein_g between 0 and 1000);
alter table public.food_logs
  add constraint food_logs_carbs_range check (carbs_g between 0 and 1000);
alter table public.food_logs
  add constraint food_logs_fat_range check (fat_g between 0 and 1000);
alter table public.food_logs
  add constraint food_logs_name_len check (char_length(name) <= 120);

-- Journal entries: title/body length.
alter table public.journal_entries
  add constraint journal_title_len check (char_length(title) <= 200);
alter table public.journal_entries
  add constraint journal_body_len check (char_length(body) <= 10000);

-- Habits: label length.
alter table public.habits
  add constraint habits_label_len check (char_length(label) <= 80);

-- VERIFICATION:
--   select conname from pg_constraint
--   where conrelid = any (array['public.runs','public.food_logs',
--     'public.journal_entries','public.community_posts','public.post_comments',
--     'public.habits']::regclass[]) and contype = 'c'
--   order by conname;
