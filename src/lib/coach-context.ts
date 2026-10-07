import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserToday, addDaysToDateStr, startOfLocalDayUTC } from "@/lib/date";
import type { LocaleCode } from "@/i18n/locales";

/**
 * Build a trusted, server-side context block about the signed-in user to
 * append to the coach's system prompt. Everything here is read from the
 * database with the user's own RLS-scoped client — never from client input —
 * so a caller can't spoof who they are or what they've done.
 */
export async function buildCoachContext(
  supabase: SupabaseClient,
  userId: string,
  locale: LocaleCode,
  tz: string,
): Promise<string> {
  const today = getUserToday(tz);
  const weekAgoDate = addDaysToDateStr(today, -7);
  const weekAgoTs = startOfLocalDayUTC(tz, new Date(Date.parse(`${weekAgoDate}T12:00:00Z`)));

  const [profileRes, habitsRes, logsRes, workoutsRes, enrollRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, primary_goals, identities, streak")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("habits").select("id, label").eq("user_id", userId),
    supabase
      .from("habit_logs")
      .select("habit_id, log_date, done")
      .eq("user_id", userId)
      .gte("log_date", weekAgoDate),
    supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("completed_at", weekAgoTs),
    supabase
      .from("program_enrollments")
      .select("program_id, current_week, current_day")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = profileRes.data as
    | { name?: string; primary_goals?: string[]; identities?: string[]; streak?: number }
    | null;
  if (!profile) return "";

  const habits = (habitsRes.data ?? []) as { id: string }[];
  const logs = (logsRes.data ?? []) as { habit_id: string; log_date: string; done: boolean }[];
  const doneToday = new Set(
    logs.filter((l) => l.done && l.log_date === today).map((l) => l.habit_id),
  ).size;
  const workouts7 = workoutsRes.count ?? 0;
  const doneLast7 = logs.filter((l) => l.done).length;

  const firstName = (profile.name ?? "").trim().split(/\s+/)[0] || "there";
  const goals = (profile.primary_goals ?? []).filter(Boolean);
  const identities = (profile.identities ?? []).filter(Boolean);

  // Today's planned session, if the user is enrolled in a program.
  let todaySession = "none scheduled";
  const enroll = enrollRes.data as
    | { program_id: string; current_week: number; current_day: number }
    | null;
  if (enroll) {
    const { data: program } = await supabase
      .from("programs")
      .select("title")
      .eq("id", enroll.program_id)
      .maybeSingle();
    const { data: week } = await supabase
      .from("program_weeks")
      .select("id")
      .eq("program_id", enroll.program_id)
      .eq("week_number", enroll.current_week)
      .maybeSingle();
    let dayTitle = "";
    if (week?.id) {
      const { data: day } = await supabase
        .from("workout_days")
        .select("title")
        .eq("program_week_id", week.id)
        .eq("day_order", enroll.current_day)
        .maybeSingle();
      dayTitle = day?.title ?? "";
    }
    const programTitle = program?.title ?? "a program";
    todaySession = dayTitle ? `${dayTitle} (${programTitle})` : programTitle;
  }

  const lines = [
    "USER CONTEXT (trusted, from our database — use it to personalize; do not repeat it verbatim):",
    `- First name: ${firstName}`,
    `- Language: ${locale === "fr" ? "French (reply in French)" : "English"}`,
    `- Goals: ${goals.length ? goals.join(", ") : "not set"}`,
    `- Identities: ${identities.length ? identities.join(", ") : "not set"}`,
    `- Current streak: ${profile.streak ?? 0} day(s)`,
    `- Today's planned session: ${todaySession}`,
    `- Habits done today: ${doneToday}/${habits.length}`,
    `- Last 7 days: ${workouts7} workout(s) logged, ${doneLast7} habit check-in(s)`,
  ];
  return lines.join("\n");
}
