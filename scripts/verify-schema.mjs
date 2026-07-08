#!/usr/bin/env node
/**
 * Confirms the live Supabase database actually has every table/column the
 * app's migrations are supposed to have created. Run this after applying
 * migrations (or any time something feels off) — it's how we caught
 * migration 0004 silently never having been applied for days.
 *
 * Usage: node --env-file=.env.local scripts/verify-schema.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/verify-schema.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const CHECKS = [
  { table: "profiles", columns: "id,primary_goal,identities,onboarded_at", migration: "0004_transformation_platform.sql" },
  { table: "user_preferences", columns: "user_id,active_coach,dashboard_layout", migration: "0004_transformation_platform.sql" },
  { table: "journal_entries", columns: "id,user_id,title,body", migration: "0004_transformation_platform.sql" },
  { table: "billing_events", columns: "id", migration: "0003_stripe_billing.sql" },
  { table: "habits", columns: "id,user_id,label,icon", migration: "0001_initial_schema.sql" },
  { table: "habit_logs", columns: "id,habit_id,log_date,done", migration: "0001_initial_schema.sql" },
  { table: "daily_stats", columns: "user_id,stat_date", migration: "0001_initial_schema.sql" },
  { table: "user_badges", columns: "user_id,badge_id,earned_at", migration: "0001_initial_schema.sql" },
  { table: "challenges", columns: "id,title,type,ends_at", migration: "0001_initial_schema.sql" },
  { table: "challenge_participants", columns: "challenge_id,user_id,progress,points", migration: "0001_initial_schema.sql" },
  { table: "food_logs", columns: "id,user_id,log_date,calories,protein_g", migration: "0001_initial_schema.sql" },
];

let allOk = true;

for (const check of CHECKS) {
  const { error } = await supabase.from(check.table).select(check.columns).limit(1);
  if (error) {
    allOk = false;
    console.error(`✗ ${check.table} — ${error.message} (from ${check.migration})`);
  } else {
    console.log(`✓ ${check.table}`);
  }
}

if (!allOk) {
  console.error(
    "\nSchema drift detected: one or more migrations haven't actually been " +
      "applied to this database. Paste the missing migration's SQL into the " +
      "Supabase SQL Editor (Project → SQL Editor → New query) and run it.",
  );
  process.exit(1);
}

console.log("\nAll expected tables/columns are present — no schema drift.");
