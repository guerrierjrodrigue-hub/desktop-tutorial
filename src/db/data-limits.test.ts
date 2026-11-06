import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Z3 Bloc E: fair-play limits (0046) and data CHECK constraints (0047).
 * Parses the migration SQL so no live database is needed (same approach as the
 * other src/db tests). Every CHECK bound must be EQUAL TO OR LOOSER THAN the
 * app's zod schema, never stricter.
 */
const DIR = join(process.cwd(), "supabase", "migrations");
const read = (f: string) => readFileSync(join(DIR, f), "utf8");
const norm = (s: string) => s.replace(/--[^\n]*/g, "").toLowerCase().replace(/\s+/g, " ");

describe("Bloc E1 — daily limits (0046)", () => {
  const sql = norm(read("0046_daily_limits.sql"));

  it("adds a daily global XP cap inside ka_award_xp", () => {
    expect(sql).toContain("create or replace function public.ka_award_xp");
    expect(sql).toContain("200 - v_today");
    expect(sql).toContain("from xp_events where user_id = p_uid and day = p_day");
  });

  it("keeps ka_award_xp SECURITY DEFINER (its execute stays revoked via 0038)", () => {
    expect(sql).toContain("security definer");
  });

  it("limits habits to 30 per user via a before-insert trigger", () => {
    expect(sql).toContain("create trigger ka_limit_habits before insert on public.habits");
    expect(sql).toMatch(/count\(\*\) from public\.habits where user_id = new\.user_id\) >= 30/);
  });

  it("limits prayer requests to 10 per day", () => {
    expect(sql).toContain("create trigger ka_limit_prayers_per_day before insert on public.prayer_requests");
    expect(sql).toContain(">= 10");
  });

  it("limits community posts to 20 per day", () => {
    expect(sql).toContain("create trigger ka_limit_posts_per_day before insert on public.community_posts");
    expect(sql).toContain(">= 20");
  });

  it("documents a rollback path", () => {
    expect(read("0046_daily_limits.sql").toLowerCase()).toContain("rollback");
  });
});

describe("Bloc E2 — data CHECK constraints (0047)", () => {
  const sql = norm(read("0047_data_check_constraints.sql"));

  it("bounds run pace to 90..1800 s/km (looser than the app band 150..900)", () => {
    expect(sql).toContain("runs_pace_band check (pace_s_per_km between 90 and 1800)");
  });

  it("bounds food calories to 0..10000 and macros to 0..1000 (matches the app zod)", () => {
    expect(sql).toContain("food_logs_calories_range check (calories between 0 and 10000)");
    expect(sql).toContain("food_logs_protein_range check (protein_g between 0 and 1000)");
    expect(sql).toContain("food_logs_carbs_range check (carbs_g between 0 and 1000)");
    expect(sql).toContain("food_logs_fat_range check (fat_g between 0 and 1000)");
    expect(sql).toContain("food_logs_name_len check (char_length(name) <= 120)");
  });

  it("bounds journal title/body length (matches the app zod)", () => {
    expect(sql).toContain("journal_title_len check (char_length(title) <= 200)");
    expect(sql).toContain("journal_body_len check (char_length(body) <= 10000)");
  });

  it("bounds habit label length (matches the app zod)", () => {
    expect(sql).toContain("habits_label_len check (char_length(label) <= 80)");
  });

  it("documents a rollback path", () => {
    expect(read("0047_data_check_constraints.sql").toLowerCase()).toContain("rollback");
  });
});

/**
 * Cross-check: the DB bounds must not be stricter than the app's zod schemas.
 * We read the app constants directly so the two can't drift apart silently.
 */
describe("Bloc E — DB bounds are never stricter than the app", () => {
  it("run pace: DB band contains the app band", () => {
    const running = readFileSync(join(process.cwd(), "src", "lib", "running.ts"), "utf8");
    const min = Number(/MIN_PACE_S_PER_KM\s*=\s*(\d+)/.exec(running)?.[1]);
    const max = Number(/MAX_PACE_S_PER_KM\s*=\s*(\d+)/.exec(running)?.[1]);
    // DB allows 90..1800; the app's accepted band must sit inside it.
    expect(min).toBeGreaterThanOrEqual(90);
    expect(max).toBeLessThanOrEqual(1800);
  });

  it("food: the app zod max equals the DB CHECK max (not stricter)", () => {
    const actions = readFileSync(
      join(process.cwd(), "src", "app", "(app)", "nutrition", "actions.ts"),
      "utf8",
    );
    expect(actions).toMatch(/calorieVal\s*=\s*z[^;]*\.max\(10000/);
    expect(actions).toMatch(/macroVal\s*=\s*z[^;]*\.max\(1000/);
  });
});
