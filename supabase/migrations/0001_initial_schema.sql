-- ============================================================================
-- Kingdom Athlete — initial schema
-- Postgres / Supabase. Relations, constraints, indexes. RLS is enabled here
-- and policies are defined in 0002_rls_policies.sql.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type fitness_level as enum ('beginner', 'intermediate', 'advanced');
create type program_category as enum (
  'strength', 'fat-loss', 'running', 'walking', 'mobility', 'hiit', 'bodyweight'
);
create type challenge_type as enum ('personal', 'friends', 'church');
create type post_kind as enum ('testimony', 'progress', 'prayer');

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Athlete',
  email text,
  avatar_url text,
  bio text,
  church text,
  favorite_verse text,
  level fitness_level not null default 'beginner',
  height_cm smallint check (height_cm between 50 and 280),
  weight_kg numeric(5, 2) check (weight_kg between 20 and 400),
  goal text,
  gender text,
  birth_date date,
  is_premium boolean not null default false,
  is_admin boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Fitness: programs → weeks → days → exercises  (catalog, publicly readable)
-- ---------------------------------------------------------------------------
create table programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category program_category not null,
  level fitness_level not null,
  weeks smallint not null check (weeks > 0),
  days_per_week smallint not null check (days_per_week between 1 and 7),
  duration_minutes smallint not null check (duration_minutes > 0),
  cover_color text not null default 'from-green-deep to-green',
  premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  week_number smallint not null check (week_number > 0),
  unique (program_id, week_number)
);
create index idx_program_weeks_program on program_weeks (program_id);

create table workout_days (
  id uuid primary key default gen_random_uuid(),
  program_week_id uuid not null references program_weeks (id) on delete cascade,
  day_order smallint not null check (day_order > 0),
  title text not null,
  focus text not null default '',
  duration_minutes smallint not null check (duration_minutes > 0),
  unique (program_week_id, day_order)
);
create index idx_workout_days_week on workout_days (program_week_id);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references workout_days (id) on delete cascade,
  exercise_order smallint not null check (exercise_order > 0),
  name text not null,
  muscles text[] not null default '{}',
  sets smallint not null check (sets > 0),
  reps text not null,
  rest_seconds smallint not null default 60 check (rest_seconds >= 0),
  notes text,
  video_url text,
  unique (workout_day_id, exercise_order)
);
create index idx_exercises_day on exercises (workout_day_id);

-- User progress against programs / workouts
create table program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  program_id uuid not null references programs (id) on delete cascade,
  current_week smallint not null default 1,
  current_day smallint not null default 1,
  started_at timestamptz not null default now(),
  unique (user_id, program_id)
);
create index idx_enrollments_user on program_enrollments (user_id);

create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  workout_day_id uuid references workout_days (id) on delete set null,
  duration_minutes smallint not null default 0,
  completed_at timestamptz not null default now()
);
create index idx_workout_logs_user_date on workout_logs (user_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- Habits & daily stats
-- ---------------------------------------------------------------------------
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text not null,
  icon text not null default 'Check',
  created_at timestamptz not null default now()
);
create index idx_habits_user on habits (user_id);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  log_date date not null default current_date,
  done boolean not null default true,
  unique (habit_id, log_date)
);
create index idx_habit_logs_user_date on habit_logs (user_id, log_date);

create table daily_stats (
  user_id uuid not null references profiles (id) on delete cascade,
  stat_date date not null default current_date,
  calories_burned integer not null default 0,
  calories_goal integer not null default 650,
  active_minutes integer not null default 0,
  active_minutes_goal integer not null default 45,
  protein_g integer not null default 0,
  water_ml integer not null default 0,
  water_goal_ml integer not null default 3000,
  primary key (user_id, stat_date)
);

-- ---------------------------------------------------------------------------
-- Gamification: badges & challenges
-- ---------------------------------------------------------------------------
create table badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  icon text not null default 'Award'
);

create table user_badges (
  user_id uuid not null references profiles (id) on delete cascade,
  badge_id uuid not null references badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  type challenge_type not null default 'personal',
  ends_at date,
  created_at timestamptz not null default now()
);

create table challenge_participants (
  challenge_id uuid not null references challenges (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  progress numeric(4, 3) not null default 0 check (progress between 0 and 1),
  points integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);
create index idx_challenge_participants_user on challenge_participants (user_id);

-- ---------------------------------------------------------------------------
-- Spiritual: verses, devotionals, reading plans, prayer, memory verses
-- ---------------------------------------------------------------------------
create table verses (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  text text not null,
  translation text not null default 'NIV'
);

create table devotionals (
  id uuid primary key default gen_random_uuid(),
  devotional_date date not null unique,
  quote text not null,
  verse_id uuid references verses (id) on delete set null,
  prayer text not null,
  reflection text not null
);

create table reading_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  total_days smallint not null check (total_days > 0)
);

create table reading_progress (
  user_id uuid not null references profiles (id) on delete cascade,
  reading_plan_id uuid not null references reading_plans (id) on delete cascade,
  completed_days smallint not null default 0 check (completed_days >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, reading_plan_id)
);

create table memory_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  reference text not null,
  text text not null,
  mastery numeric(3, 2) not null default 0 check (mastery between 0 and 1),
  created_at timestamptz not null default now()
);
create index idx_memory_verses_user on memory_verses (user_id);

create table prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  answered boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_prayer_requests_user on prayer_requests (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Nutrition
-- ---------------------------------------------------------------------------
create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  calories integer not null check (calories >= 0),
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fat_g integer not null default 0,
  minutes smallint not null default 0,
  tags text[] not null default '{}'
);

create table food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  log_date date not null default current_date,
  name text not null,
  calories integer not null default 0,
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fat_g integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_food_logs_user_date on food_logs (user_id, log_date);

-- ---------------------------------------------------------------------------
-- Community: groups, posts, likes, comments
-- ---------------------------------------------------------------------------
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '⛪',
  created_at timestamptz not null default now()
);

create table group_members (
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  kind post_kind not null default 'progress',
  created_at timestamptz not null default now()
);
create index idx_posts_created on community_posts (created_at desc);

create table post_likes (
  post_id uuid not null references community_posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  primary key (post_id, user_id)
);

create table post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_comments_post on post_comments (post_id, created_at);

-- ---------------------------------------------------------------------------
-- Enable Row Level Security on every table (policies in 0002).
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table programs enable row level security;
alter table program_weeks enable row level security;
alter table workout_days enable row level security;
alter table exercises enable row level security;
alter table program_enrollments enable row level security;
alter table workout_logs enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table daily_stats enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table verses enable row level security;
alter table devotionals enable row level security;
alter table reading_plans enable row level security;
alter table reading_progress enable row level security;
alter table memory_verses enable row level security;
alter table prayer_requests enable row level security;
alter table recipes enable row level security;
alter table food_logs enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table community_posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
