-- ============================================================================
-- Kingdom Athlete — Stripe billing columns
-- Adds subscription state to profiles. Updated exclusively by the Stripe
-- webhook via the service role (bypasses RLS), never by clients.
-- ============================================================================

alter table profiles
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text,
  add column subscription_status text,          -- active | trialing | canceled | past_due …
  add column subscription_price_id text,
  add column current_period_end timestamptz;

create index idx_profiles_stripe_customer on profiles (stripe_customer_id);

-- Billing events audit log (written by the webhook).
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  stripe_event_id text unique,
  type text not null,
  created_at timestamptz not null default now()
);
alter table billing_events enable row level security;

-- Owners may read their own billing history; only the service role writes.
create policy "Owner can read billing_events"
  on billing_events for select
  using (auth.uid() = user_id);
