import { NextResponse } from "next/server";
import { getAuthedContext } from "@/lib/supabase/auth";

/**
 * Loi 25 / data-portability export. Streams every row the signed-in user owns
 * as a single JSON file. Uses the user's own RLS-scoped client, so it can only
 * ever read that user's own data. In demo mode (no backend) it returns a small
 * placeholder so the button still produces a file.
 */

// Tables keyed by the user's id column. profiles is keyed by `id`; everything
// else by `user_id`.
const USER_TABLES: { table: string; column: "user_id" | "id" }[] = [
  { table: "habits", column: "user_id" },
  { table: "habit_logs", column: "user_id" },
  { table: "journal_entries", column: "user_id" },
  { table: "prayer_requests", column: "user_id" },
  { table: "workout_logs", column: "user_id" },
  { table: "program_enrollments", column: "user_id" },
  { table: "food_logs", column: "user_id" },
  { table: "daily_stats", column: "user_id" },
  { table: "memory_verses", column: "user_id" },
  { table: "memory_verse_progress", column: "user_id" },
  { table: "reading_progress", column: "user_id" },
  { table: "challenge_participants", column: "user_id" },
  { table: "group_members", column: "user_id" },
  { table: "community_posts", column: "user_id" },
  { table: "post_comments", column: "user_id" },
  { table: "post_likes", column: "user_id" },
  { table: "user_badges", column: "user_id" },
  { table: "notification_preferences", column: "user_id" },
  { table: "user_preferences", column: "user_id" },
  { table: "coach_messages", column: "user_id" },
];

export async function GET() {
  const ctx = await getAuthedContext();
  const stamp = new Date().toISOString().slice(0, 10);

  if (!ctx) {
    const body = JSON.stringify(
      { demo: true, note: "Data export is available on a real account." },
      null,
      2,
    );
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="kingdom-athlete-export-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("*")
    .eq("id", ctx.userId)
    .maybeSingle();

  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    userId: ctx.userId,
    profile: profile ?? null,
  };

  for (const { table, column } of USER_TABLES) {
    const { data: rows, error } = await ctx.supabase
      .from(table)
      .select("*")
      .eq(column, ctx.userId);
    // A table that doesn't exist yet (e.g. before a later migration) is simply
    // skipped rather than failing the whole export.
    data[table] = error ? [] : (rows ?? []);
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kingdom-athlete-export-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
