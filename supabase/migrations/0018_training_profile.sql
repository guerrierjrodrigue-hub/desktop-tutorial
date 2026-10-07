-- 0018: Training-profile fields for personalization. Additive, nullable.
-- Stored on profiles (owner-only RLS already in place). The profile_public
-- view selects an explicit column list (id, name, avatar_url, level, xp,
-- streak) and is NOT changed here, so none of these are publicly exposed.

alter table profiles
  add column if not exists equipment text,
  add column if not exists training_days smallint,
  add column if not exists reminder_time text;

alter table profiles
  add constraint profiles_training_days_range
  check (training_days is null or (training_days >= 1 and training_days <= 7)) not valid;
