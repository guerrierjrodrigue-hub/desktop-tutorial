-- ============================================================================
-- Kingdom Athlete — user-created challenges
-- Challenges were admin-only (catalog table). Users can now create their own
-- personal/friends/church challenges; admins keep full control over all rows.
-- ============================================================================

alter table challenges
  add column created_by uuid references profiles (id) on delete set null;

create policy "Users can create challenges"
  on challenges for insert
  with check (auth.uid() = created_by);
