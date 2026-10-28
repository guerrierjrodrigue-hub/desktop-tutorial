import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Launch guard (Z1): every SECURITY DEFINER function in the `public` schema runs
 * with the owner's rights, so if anon/authenticated keep the default PUBLIC
 * EXECUTE grant they can call these privileged helpers directly over PostgREST.
 * This test fails if any such function is missing a REVOKE that takes EXECUTE
 * away from anon (directly or via PUBLIC), which is how we keep them unreachable.
 *
 * is_admin() is the one allowed exception: RLS policies reference it and are
 * evaluated as the calling role, so anon/authenticated must keep EXECUTE on it.
 */

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const ALLOWED_EXECUTABLE = new Set(["is_admin"]);

function allMigrationSql(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8"))
    .join("\n");
}

/** Names of SECURITY DEFINER functions defined on the public schema. */
function securityDefinerFunctions(sql: string): Set<string> {
  const names = new Set<string>();
  // Match `create [or replace] function [public.]name(` so trigger lines like
  // `execute function foo()` are ignored. Bare names resolve to the public schema.
  const defRe = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?(\w+)\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = defRe.exec(sql)) !== null) {
    // `security definer` can appear in the header (before the `$$` body) or in
    // the trailing modifiers (after the body, before the statement `;`), so scan
    // both regions and skip the body itself.
    const open = sql.indexOf("$$", m.index);
    let region: string;
    if (open === -1) {
      region = sql.slice(m.index, m.index + 600);
    } else {
      const close = sql.indexOf("$$", open + 2);
      const tailEnd = close === -1 ? sql.length : sql.indexOf(";", close + 2);
      region = sql.slice(m.index, open) + " " + sql.slice(close + 2, tailEnd === -1 ? sql.length : tailEnd);
    }
    if (/security\s+definer/i.test(region)) names.add(m[1].toLowerCase());
  }
  return names;
}

/** Functions that have EXECUTE revoked from anon (directly or via PUBLIC). */
function revokedFromAnon(sql: string): Set<string> {
  const names = new Set<string>();
  const re = /revoke\s+execute\s+on\s+function\s+public\.(\w+)\s*\([^)]*\)\s+from\s+([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const from = m[2].toLowerCase();
    if (/\banon\b/.test(from) || /\bpublic\b/.test(from)) names.add(m[1].toLowerCase());
  }
  return names;
}

describe("SECURITY DEFINER functions are not executable by anon", () => {
  const sql = allMigrationSql();
  const secdef = securityDefinerFunctions(sql);
  const revoked = revokedFromAnon(sql);

  it("finds the known internal functions (sanity)", () => {
    for (const fn of ["ka_award_xp", "ka_xp_run", "handle_new_user", "evaluate_badges"]) {
      expect(secdef.has(fn), `expected ${fn} to be a SECURITY DEFINER function`).toBe(true);
    }
  });

  it("revokes EXECUTE from anon on every SECURITY DEFINER function (except is_admin)", () => {
    const exposed = [...secdef].filter((fn) => !ALLOWED_EXECUTABLE.has(fn) && !revoked.has(fn));
    expect(exposed, `SECURITY DEFINER functions still executable by anon: ${exposed.join(", ")}`).toEqual([]);
  });

  it("keeps is_admin executable (RLS depends on it)", () => {
    expect(revoked.has("is_admin")).toBe(false);
  });
});
