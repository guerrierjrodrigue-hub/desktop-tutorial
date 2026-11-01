import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Launch guard (Z2 / D-01): a signed-in user must never be able to edit their
 * own privileges or billing. These columns on `public.profiles` are writable
 * only by the service role or a SECURITY DEFINER function, never by the
 * `authenticated` role over PostgREST:
 */
const PROTECTED_COLUMNS = [
  "is_admin",
  "is_premium",
  "xp",
  "email",
  "streak",
  "stripe_customer_id",
  "stripe_subscription_id",
  "subscription_price_id",
  "subscription_status",
  "current_period_end",
] as const;

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

/** Concatenate every migration, in order, with SQL comments stripped. */
function allMigrationSql(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
    // Drop line comments so a rollback note ("grant ... to authenticated;") is
    // never mistaken for a real statement.
    .map((sql) => sql.replace(/--[^\n]*/g, ""))
    .join("\n");
}

const AUTHED = /\b(authenticated|public)\b/;

/**
 * Replay the grant/revoke statements that touch public.profiles, in file order,
 * to compute which columns the `authenticated` role may UPDATE.
 *
 * Supabase grants table-level privileges to `authenticated` by default, so the
 * starting point is "every column" until a migration revokes it. A table-level
 * grant of UPDATE (or ALL) re-opens everything; a column-level grant adds just
 * those columns; the matching revokes take them away again.
 */
function updatableColumnsForAuthenticated(sql: string): { all: boolean; cols: Set<string> } {
  let all = true; // Supabase default: authenticated holds table privileges.
  const cols = new Set<string>();

  // One regex per statement shape, scanned together in document order.
  const stmtRe =
    /(grant|revoke)\s+([a-z, ()_\n\t]+?)\s+on\s+(?:table\s+)?(?:public\.)?profiles\s+(?:to|from)\s+([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = stmtRe.exec(sql)) !== null) {
    const action = m[1].toLowerCase();
    const privs = m[2].toLowerCase();
    const roles = m[3].toLowerCase();
    if (!AUTHED.test(roles)) continue;

    // Column list inside the privilege clause, e.g. "update (a, b, c)".
    const colMatch = /update\s*\(([^)]*)\)/i.exec(privs);
    const listedCols = colMatch
      ? colMatch[1].split(",").map((c) => c.trim()).filter(Boolean)
      : null;
    const mentionsUpdate = /\bupdate\b/.test(privs) || /\ball\b/.test(privs);
    if (!mentionsUpdate) continue;

    if (action === "grant") {
      if (listedCols) {
        for (const c of listedCols) cols.add(c);
      } else {
        all = true; // table-level UPDATE/ALL re-opens every column
      }
    } else {
      // revoke
      if (listedCols) {
        for (const c of listedCols) cols.delete(c);
      } else {
        all = false; // table-level UPDATE/ALL revoked
        cols.clear();
      }
    }
  }
  return { all, cols };
}

describe("authenticated cannot write privilege or billing columns on profiles", () => {
  const sql = allMigrationSql();
  const { all, cols } = updatableColumnsForAuthenticated(sql);

  it("revokes the table-level UPDATE that Supabase grants by default", () => {
    // If this fails, `authenticated` can update every column, protected or not.
    expect(all, "table-level UPDATE on profiles is still held by authenticated").toBe(false);
  });

  for (const col of PROTECTED_COLUMNS) {
    it(`does not let authenticated update profiles.${col}`, () => {
      expect(
        !all && !cols.has(col),
        `profiles.${col} is updatable by the authenticated role`,
      ).toBe(true);
    });
  }
});
