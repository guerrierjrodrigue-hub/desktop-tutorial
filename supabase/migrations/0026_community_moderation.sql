-- S3 — Community moderation: length limits, reporting, blocking, and admin
-- hide/delete. Additive only.

-- ---------------------------------------------------------------------------
-- 1. Length limits enforced in the database (the authoritative guard; the
--    server actions mirror these so the user gets a friendly message first).
-- ---------------------------------------------------------------------------
alter table community_posts
  add constraint community_posts_content_len check (char_length(content) <= 1000);

alter table post_comments
  add constraint post_comments_body_len check (char_length(body) <= 500);

-- ---------------------------------------------------------------------------
-- 2. Soft-hide flag for moderated content (admins hide; the feed filters it).
-- ---------------------------------------------------------------------------
alter table community_posts add column if not exists hidden boolean not null default false;
alter table post_comments add column if not exists hidden boolean not null default false;

-- ---------------------------------------------------------------------------
-- 3. Admin predicate used by the moderation policies. SECURITY DEFINER so it
--    can read profiles.is_admin regardless of the caller's own RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
  language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- 4. Reports: a member flags a post or a comment; admins triage.
-- ---------------------------------------------------------------------------
create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  post_id uuid references community_posts (id) on delete cascade,
  comment_id uuid references post_comments (id) on delete cascade,
  reason text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  constraint content_reports_target check (post_id is not null or comment_id is not null),
  constraint content_reports_reason_len check (char_length(reason) <= 500),
  constraint content_reports_status check (status in ('open', 'resolved'))
);
create index if not exists idx_reports_status on content_reports (status, created_at desc);
-- One standing report per member per target (a repeat is a no-op, not a dupe).
create unique index if not exists ux_reports_reporter_post
  on content_reports (reporter_id, post_id) where post_id is not null;
create unique index if not exists ux_reports_reporter_comment
  on content_reports (reporter_id, comment_id) where comment_id is not null;

alter table content_reports enable row level security;
create policy "Reporter can file reports"
  on content_reports for insert with check (auth.uid() = reporter_id);
create policy "Admins read reports"
  on content_reports for select using (public.is_admin());
create policy "Admins update reports"
  on content_reports for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Blocks: a member hides another member's content from their own feed.
-- ---------------------------------------------------------------------------
create table if not exists user_blocks (
  blocker_id uuid not null references profiles (id) on delete cascade,
  blocked_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

alter table user_blocks enable row level security;
create policy "Owner reads own blocks"
  on user_blocks for select using (auth.uid() = blocker_id);
create policy "Owner creates own blocks"
  on user_blocks for insert with check (auth.uid() = blocker_id);
create policy "Owner removes own blocks"
  on user_blocks for delete using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- 6. Admin moderation on content: hide (update) or remove (delete) any post or
--    comment. These are added alongside the existing owner-only policies, which
--    RLS OR-combines, so authors keep full control of their own content.
-- ---------------------------------------------------------------------------
create policy "Admins update any post"
  on community_posts for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete any post"
  on community_posts for delete using (public.is_admin());
create policy "Admins update any comment"
  on post_comments for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete any comment"
  on post_comments for delete using (public.is_admin());
