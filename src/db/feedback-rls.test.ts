import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Z3 Bloc D: the beta feedback table must isolate users from each other.
 * A signed-in user may insert only rows attributed to themselves and read only
 * their own rows (admins read all); a per-user hourly rate limit caps abuse.
 * This asserts the migration encodes those guarantees — it parses the SQL so no
 * live database is needed (same approach as profiles-write-privileges.test.ts).
 */
const MIGRATION = join(process.cwd(), "supabase", "migrations", "0045_feedback_channel.sql");

function sql(): string {
  // Drop line comments so the rollback note is never read as a statement.
  return readFileSync(MIGRATION, "utf8").replace(/--[^\n]*/g, "");
}

describe("feedback table RLS (migration 0045)", () => {
  const text = sql();
  const normalized = text.toLowerCase().replace(/\s+/g, " ");

  it("enables row level security", () => {
    expect(normalized).toContain("alter table public.feedback enable row level security");
  });

  it("insert is restricted to the caller's own rows", () => {
    // The INSERT policy must check user_id = auth.uid().
    const insert = /create policy feedback_insert_own on public\.feedback\s+for insert[^;]+;/i.exec(text);
    expect(insert).not.toBeNull();
    expect(insert![0].toLowerCase().replace(/\s+/g, " ")).toContain("with check (user_id = auth.uid())");
  });

  it("select is restricted to the owner or an admin", () => {
    const select = /create policy feedback_select_own on public\.feedback\s+for select[^;]+;/i.exec(text);
    expect(select).not.toBeNull();
    const body = select![0].toLowerCase().replace(/\s+/g, " ");
    expect(body).toContain("user_id = auth.uid()");
    expect(body).toContain("public.is_admin()");
  });

  it("does NOT expose an unrestricted (using (true)) read policy", () => {
    expect(normalized).not.toMatch(/for select[^;]*using \(true\)/);
  });

  it("caps submissions with a per-user hourly rate-limit trigger", () => {
    expect(normalized).toContain("create trigger ka_feedback_rate_limit before insert on public.feedback");
    expect(normalized).toContain("interval '1 hour'");
    expect(normalized).toContain("recent >= 5");
  });

  it("bounds the message to 2000 chars, never stricter than the app's zod schema", () => {
    expect(normalized).toContain("char_length(message) between 5 and 2000");
  });

  it("restricts kind to the three allowed categories", () => {
    expect(normalized).toContain("kind in ('bug', 'idee', 'autre')");
  });

  it("documents a rollback path", () => {
    // Read the RAW file (comments intact) — the rollback note lives in comments.
    const raw = readFileSync(MIGRATION, "utf8").toLowerCase();
    expect(raw).toContain("rollback");
    expect(raw).toContain("drop table if exists public.feedback");
  });
});
