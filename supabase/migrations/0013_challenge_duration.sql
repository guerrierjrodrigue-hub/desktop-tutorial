-- 0013: Per-join challenge windows + a measurable replacement challenge.
--
-- Additive only. Challenges used fixed ends_at dates (current_date + N) seeded
-- once, so they all read "0 days left" now. Instead, each challenge has a
-- duration and its window starts when a user JOINS (start = joined_at, end =
-- start + duration_days). The "Grace Community Step Challenge" promised 200k
-- steps, but the app tracks no steps — replace it with a workout-count
-- challenge measured from the workout log the app already records.

alter table challenges
  add column if not exists duration_days smallint not null default 30;

-- How a challenge's progress is measured: 'manual' (stored) or 'workouts'
-- (derived from the user's workout_logs since they joined).
alter table challenges
  add column if not exists metric text not null default 'manual';

-- Per-challenge durations (title-keyed; no deletes, idempotent).
update challenges set duration_days = 40 where title = '40 Days of Discipline';
update challenges set duration_days = 14 where title = 'Iron Sharpens Iron';
update challenges set duration_days = 28 where title = 'Sabbath Rest Challenge';

-- Replace the unmeasurable step challenge with a workout-count challenge.
update challenges
set title = 'Church vs. Church: 30 workouts this month',
    description = 'Your church against the rest — log 30 workouts in 30 days. Measured from your real workout log.',
    type = 'church',
    duration_days = 30,
    metric = 'workouts'
where title = 'Grace Community Step Challenge';
