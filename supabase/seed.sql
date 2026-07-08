-- ============================================================================
-- Kingdom Athlete — catalog seed data
-- Populates publicly-readable catalog tables. User-owned rows are created at
-- runtime. Run with: supabase db reset (which applies migrations + seed).
-- ============================================================================

-- Badges ---------------------------------------------------------------------
insert into badges (slug, name, description, icon) values
  ('first-steps', 'First Steps', 'Completed your first workout', 'Footprints'),
  ('seven-day-fire', 'Seven-Day Fire', '7-day streak', 'Flame'),
  ('word-warrior', 'Word Warrior', 'Read Scripture 30 days', 'Sword'),
  ('iron-discipline', 'Iron Discipline', '50 workouts logged', 'Dumbbell'),
  ('marathon-soul', 'Marathon Soul', '100-day streak', 'Trophy'),
  ('prayer-pillar', 'Prayer Pillar', 'Logged 100 prayers', 'HandHeart')
on conflict (slug) do nothing;

-- Verses ---------------------------------------------------------------------
insert into verses (reference, text, translation) values
  ('1 Corinthians 6:19-20',
   'Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.',
   'NIV'),
  ('Isaiah 40:31', 'Those who hope in the Lord will renew their strength.', 'NIV'),
  ('Philippians 4:13', 'I can do all things through Christ who strengthens me.', 'NKJV');

-- Devotional (today) ---------------------------------------------------------
insert into devotionals (devotional_date, quote, verse_id, prayer, reflection)
select
  current_date,
  'Discipline is the bridge between where you are and where God is calling you to be.',
  v.id,
  'Father, thank You for this new day and for the body You have entrusted to me. Give me the discipline to train it well, the humility to depend on You, and the joy of honoring You in every rep, every meal, and every quiet moment. In Jesus'' name, amen.',
  'Physical training has value, but godliness holds promise for both this life and the next. Today, let your workout be worship — an offering of strength back to the One who gave it.'
from verses v
where v.reference = '1 Corinthians 6:19-20'
on conflict (devotional_date) do nothing;

-- Reading plans --------------------------------------------------------------
insert into reading_plans (slug, title, description, total_days) values
  ('gospels-30', 'The Gospels in 30 Days', 'Walk through the life of Jesus, one chapter at a time.', 30),
  ('psalms-strength', 'Psalms of Strength', '31 days of courage, refuge, and praise.', 31),
  ('proverbs-discipline', 'Proverbs for Discipline', 'Daily wisdom for a disciplined life.', 31),
  ('fitness-faith', 'Fitness & Faith', 'Curated readings on stewardship of the body.', 14)
on conflict (slug) do nothing;

-- Recipes --------------------------------------------------------------------
insert into recipes (name, calories, protein_g, carbs_g, fat_g, minutes, tags) values
  ('Warrior Protein Bowl', 540, 45, 48, 16, 20, array['High protein', 'Meal prep']),
  ('Daniel Fast Lentil Stew', 380, 22, 55, 6, 40, array['Plant-based', 'Fasting']),
  ('Sunrise Egg & Oats', 420, 28, 44, 14, 12, array['Breakfast', 'Quick']),
  ('Grilled Salmon & Greens', 480, 40, 18, 26, 25, array['Low carb', 'Omega-3']),
  ('Recovery Berry Smoothie', 260, 24, 30, 4, 5, array['Post-workout', 'Quick']),
  ('Shepherd''s Chicken & Rice', 610, 46, 62, 18, 35, array['Bulk', 'Family']),
  ('Overnight Protein Oats', 380, 32, 45, 8, 8, array['Breakfast', 'Meal prep']),
  ('Mediterranean Tuna Bowl', 460, 38, 38, 16, 15, array['High protein', 'Quick']),
  ('Turkey Chili', 520, 42, 48, 14, 45, array['Bulk', 'Meal prep']);

-- Groups ---------------------------------------------------------------------
insert into groups (name, emoji) values
  ('Grace Community Athletes', '⛪'),
  ('5AM Warriors', '🌅'),
  ('Strong Moms in Christ', '💪'),
  ('Marathon Disciples', '🏃');

-- Challenges -----------------------------------------------------------------
insert into challenges (title, description, type, ends_at) values
  ('40 Days of Discipline', 'Complete a workout and a devotional every day for 40 days.', 'personal', current_date + 14),
  ('Grace Community Step Challenge', 'Your church vs. others — log 200k steps this month.', 'church', current_date + 9),
  ('Iron Sharpens Iron', 'You & 3 friends: 12 workouts in 2 weeks.', 'friends', current_date + 5),
  ('Sabbath Rest Challenge', 'Protect one full day of rest each week for a month.', 'personal', current_date + 21);

-- Programs + nested weeks/days/exercises -------------------------------------
-- "Foundations of Strength": full week 1 with three training days.
with p as (
  insert into programs
    (slug, title, description, category, level, weeks, days_per_week, duration_minutes, cover_color, premium)
  values
    ('foundations-of-strength',
     'Foundations of Strength',
     'Build a resilient base with compound lifts and disciplined progression. Perfect for reclaiming consistency.',
     'strength', 'beginner', 8, 3, 45, 'from-green-deep to-green', false)
  returning id
),
w as (
  insert into program_weeks (program_id, week_number)
  select id, 1 from p
  returning id
),
d1 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 1, 'Lower Body Power', 'Quads, glutes, hamstrings', 45 from w
  returning id
),
d2 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 2, 'Upper Body Push', 'Chest, shoulders, triceps', 45 from w
  returning id
),
d3 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 3, 'Upper Body Pull', 'Back, biceps', 45 from w
  returning id
)
insert into exercises (workout_day_id, exercise_order, name, muscles, sets, reps, rest_seconds)
select id, 1, 'Back Squat', array['Quads', 'Glutes'], 4, '6-8', 120 from d1
union all select id, 2, 'Romanian Deadlift', array['Hamstrings'], 3, '8-10', 90 from d1
union all select id, 3, 'Walking Lunge', array['Glutes', 'Quads'], 3, '12', 60 from d1
union all select id, 1, 'Bench Press', array['Chest', 'Triceps'], 4, '6-8', 120 from d2
union all select id, 2, 'Overhead Press', array['Shoulders'], 3, '8-10', 90 from d2
union all select id, 3, 'Dips', array['Triceps', 'Chest'], 3, '10-12', 60 from d2
union all select id, 1, 'Barbell Row', array['Back'], 4, '8-10', 90 from d3
union all select id, 2, 'Pull-ups', array['Back', 'Biceps'], 3, 'AMRAP', 90 from d3
union all select id, 3, 'Dumbbell Curl', array['Biceps'], 3, '12', 45 from d3;

-- Remaining programs (catalog entries; weeks/days can be authored in admin).
insert into programs
  (slug, title, description, category, level, weeks, days_per_week, duration_minutes, cover_color, premium)
values
  ('lean-and-disciplined', 'Lean & Disciplined',
   'A metabolic conditioning plan to shed fat while building enduring habits of self-control.',
   'fat-loss', 'intermediate', 6, 4, 35, 'from-gold-deep to-bronze', true),
  ('run-your-race', 'Run Your Race',
   'Couch-to-5K progression with Scripture-paced intervals. Endurance for body and faith.',
   'running', 'beginner', 9, 3, 30, 'from-green to-green-bright', false),
  ('mobility-and-rest', 'Mobility & Rest',
   'Restore range of motion and find stillness. Gentle flows paired with guided breath prayer.',
   'mobility', 'beginner', 4, 5, 20, 'from-elevated to-surface-2', false),
  ('warrior-hiit', 'Warrior HIIT',
   'High-intensity intervals to forge mental toughness. Short, brutal, effective.',
   'hiit', 'advanced', 6, 4, 25, 'from-gold to-gold-deep', true),
  ('bodyweight-anywhere', 'Bodyweight Anywhere',
   'No gym, no excuses. A full calisthenics progression you can do anywhere.',
   'bodyweight', 'intermediate', 8, 4, 30, 'from-green-deep to-elevated', false)
on conflict (slug) do nothing;

-- Week 1 content for the remaining five programs (previously catalog-only).
with w as (
  insert into program_weeks (program_id, week_number)
  select id, 1 from programs where slug = 'lean-and-disciplined'
  returning id
),
d1 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 1, 'Full-Body Burn', 'Conditioning', 35 from w returning id
),
d2 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 2, 'Metabolic Circuit', 'Strength endurance', 35 from w returning id
),
d3 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 3, 'Core & Conditioning', 'Core, cardio', 30 from w returning id
),
d4 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 4, 'Sprint Intervals', 'Anaerobic', 25 from w returning id
)
insert into exercises (workout_day_id, exercise_order, name, muscles, sets, reps, rest_seconds)
select id, 1, 'Thruster', array['Full body'], 4, '12', 45 from d1
union all select id, 2, 'Kettlebell Swing', array['Posterior chain'], 4, '20', 40 from d1
union all select id, 3, 'Burpee', array['Full body'], 3, '15', 40 from d1
union all select id, 1, 'Goblet Squat', array['Quads', 'Glutes'], 4, '15', 40 from d2
union all select id, 2, 'Push-up', array['Chest'], 4, '15', 40 from d2
union all select id, 3, 'Renegade Row', array['Back', 'Core'], 3, '10/side', 45 from d2
union all select id, 1, 'Hollow Hold', array['Core'], 4, '30s', 30 from d3
union all select id, 2, 'Russian Twist', array['Obliques'], 3, '20', 30 from d3
union all select id, 3, 'Rowing Intervals', array['Cardio'], 5, '250m', 60 from d3
union all select id, 1, 'Hill / Bike Sprint', array['Legs', 'Cardio'], 8, '20s max', 60 from d4
union all select id, 2, 'Plank', array['Core'], 3, '45s', 30 from d4;

with w as (
  insert into program_weeks (program_id, week_number)
  select id, 1 from programs where slug = 'run-your-race'
  returning id
),
d1 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 1, 'Interval Run', 'Cardio base', 30 from w returning id
),
d2 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 2, 'Tempo Run', 'Lactate threshold', 30 from w returning id
),
d3 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 3, 'Long Slow Run', 'Aerobic endurance', 40 from w returning id
)
insert into exercises (workout_day_id, exercise_order, name, muscles, sets, reps, rest_seconds)
select id, 1, 'Brisk Walk Warm-up', array['Cardio'], 1, '5m', 0 from d1
union all select id, 2, 'Run / Walk Intervals', array['Cardio'], 6, '60s run / 90s walk', 0 from d1
union all select id, 3, 'Cool-down Walk', array['Recovery'], 1, '5m', 0 from d1
union all select id, 1, 'Easy Jog Warm-up', array['Cardio'], 1, '8m', 0 from d2
union all select id, 2, 'Comfortably-Hard Tempo', array['Cardio'], 1, '12m', 0 from d2
union all select id, 3, 'Cool-down', array['Recovery'], 1, '5m', 0 from d2
union all select id, 1, 'Conversational-Pace Run', array['Cardio'], 1, '30-40m', 0 from d3
union all select id, 2, 'Post-run Stretch', array['Mobility'], 1, '5m', 0 from d3;

with w as (
  insert into program_weeks (program_id, week_number)
  select id, 1 from programs where slug = 'mobility-and-rest'
  returning id
),
d1 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 1, 'Hip & Spine Flow', 'Hips, spine', 20 from w returning id
),
d2 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 2, 'Shoulder & T-Spine', 'Shoulders, upper back', 20 from w returning id
),
d3 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 3, 'Lower Body Release', 'Hamstrings, calves', 18 from w returning id
),
d4 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 4, 'Full Body Flow', 'Whole body', 22 from w returning id
),
d5 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 5, 'Breath & Stillness', 'Recovery, prayer', 15 from w returning id
)
insert into exercises (workout_day_id, exercise_order, name, muscles, sets, reps, rest_seconds)
select id, 1, 'Cat-Cow', array['Spine'], 2, '10', 20 from d1
union all select id, 2, 'Pigeon Stretch', array['Hips'], 2, '45s/side', 15 from d1
union all select id, 3, 'World''s Greatest Stretch', array['Full body'], 2, '5/side', 15 from d1
union all select id, 1, 'Thread the Needle', array['T-spine'], 2, '8/side', 15 from d2
union all select id, 2, 'Wall Angels', array['Shoulders'], 3, '12', 20 from d2
union all select id, 1, 'Hamstring Floss', array['Hamstrings'], 2, '10/side', 15 from d3
union all select id, 2, 'Calf Wall Stretch', array['Calves'], 2, '45s/side', 15 from d3
union all select id, 1, 'Sun Salutation Flow', array['Full body'], 3, '5 breaths', 20 from d4
union all select id, 2, 'Deep Squat Hold', array['Hips'], 2, '60s', 20 from d4
union all select id, 1, 'Box Breathing', array['Nervous system'], 4, '4-4-4-4', 0 from d5
union all select id, 2, 'Psalm 23 Breath Prayer', array['Stillness'], 1, '8m', 0 from d5;

with w as (
  insert into program_weeks (program_id, week_number)
  select id, 1 from programs where slug = 'warrior-hiit'
  returning id
),
d1 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 1, 'Tabata Assault', 'Anaerobic power', 25 from w returning id
),
d2 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 2, 'EMOM Grind', 'Strength conditioning', 24 from w returning id
),
d3 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 3, 'AMRAP Chaos', 'Muscular endurance', 20 from w returning id
),
d4 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 4, 'Finisher Ladder', 'Grit', 18 from w returning id
)
insert into exercises (workout_day_id, exercise_order, name, muscles, sets, reps, rest_seconds)
select id, 1, 'Jump Squat', array['Legs'], 8, '20s on / 10s off', 10 from d1
union all select id, 2, 'Mountain Climbers', array['Core'], 8, '20s on / 10s off', 10 from d1
union all select id, 1, 'Power Clean', array['Full body'], 6, '5 / min', 0 from d2
union all select id, 2, 'Wall Ball', array['Legs', 'Shoulders'], 6, '12 / min', 0 from d2
union all select id, 1, 'Burpee', array['Full body'], 1, 'AMRAP 5m', 0 from d3
union all select id, 2, 'Toes-to-Bar', array['Core'], 1, 'AMRAP 5m', 0 from d3
union all select id, 1, 'Thruster Ladder', array['Full body'], 1, '10-1 down', 0 from d4
union all select id, 2, 'Row Sprint', array['Cardio'], 3, '300m', 60 from d4;

with w as (
  insert into program_weeks (program_id, week_number)
  select id, 1 from programs where slug = 'bodyweight-anywhere'
  returning id
),
d1 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 1, 'Push Focus', 'Chest, shoulders, triceps', 30 from w returning id
),
d2 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 2, 'Pull Focus', 'Back, biceps', 30 from w returning id
),
d3 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 3, 'Legs Focus', 'Quads, glutes, hamstrings', 30 from w returning id
),
d4 as (
  insert into workout_days (program_week_id, day_order, title, focus, duration_minutes)
  select id, 4, 'Core Focus', 'Abs, obliques', 24 from w returning id
)
insert into exercises (workout_day_id, exercise_order, name, muscles, sets, reps, rest_seconds)
select id, 1, 'Push-up Variations', array['Chest'], 4, '12-20', 60 from d1
union all select id, 2, 'Pike Push-up', array['Shoulders'], 3, '10', 60 from d1
union all select id, 3, 'Bench Dips', array['Triceps'], 3, '15', 45 from d1
union all select id, 1, 'Inverted Row', array['Back'], 4, '10-12', 60 from d2
union all select id, 2, 'Chin-ups', array['Back', 'Biceps'], 3, 'AMRAP', 75 from d2
union all select id, 3, 'Superman Hold', array['Lower back'], 3, '30s', 30 from d2
union all select id, 1, 'Assisted Pistol Squat', array['Quads'], 4, '6/side', 60 from d3
union all select id, 2, 'Bulgarian Split Squat', array['Glutes', 'Quads'], 3, '12/side', 60 from d3
union all select id, 3, 'Glute Bridge', array['Glutes'], 3, '20', 40 from d3
union all select id, 1, 'Hollow Body Hold', array['Core'], 4, '30s', 30 from d4
union all select id, 2, 'Leg Raises', array['Lower abs'], 3, '15', 40 from d4
union all select id, 3, 'Side Plank', array['Obliques'], 3, '40s/side', 30 from d4;
