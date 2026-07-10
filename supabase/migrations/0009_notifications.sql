-- ============================================================================
-- Kingdom Athlete — push notification reminders
-- One row per subscribed browser/device (a user may have several), plus one
-- notification_preferences row per user holding their reminder times. The
-- last_*_sent_date columns are a dedupe guard so a cron that runs every few
-- minutes never sends the same day's reminder twice.
-- ============================================================================

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index idx_push_subscriptions_user on push_subscriptions (user_id);
alter table push_subscriptions enable row level security;
create policy "Owner can manage own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table notification_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  locale text not null default 'en',
  timezone text not null default 'UTC',
  verse_reminder_enabled boolean not null default false,
  verse_reminder_time text,
  workout_reminder_enabled boolean not null default false,
  workout_reminder_time text,
  last_verse_sent_date date,
  last_workout_sent_date date,
  updated_at timestamptz not null default now()
);
alter table notification_preferences enable row level security;
create policy "Owner can read own notification_preferences"
  on notification_preferences for select using (auth.uid() = user_id);
create policy "Owner can insert own notification_preferences"
  on notification_preferences for insert with check (auth.uid() = user_id);
create policy "Owner can update own notification_preferences"
  on notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create trigger notification_preferences_updated_at
  before update on notification_preferences
  for each row execute function set_updated_at();

-- The cron endpoint runs with the service role and needs to read/update
-- every user's reminder rows across accounts, so it bypasses RLS via that
-- role rather than needing a broader policy here (same pattern as the Stripe
-- webhook's use of the service-role client).
