import { getAuthedContext } from "@/lib/supabase/auth";
import type { NotificationPreferences } from "@/types";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  timezone: "UTC",
  verseReminderEnabled: false,
  verseReminderTime: null,
  workoutReminderEnabled: false,
  workoutReminderTime: null,
};

/** The signed-in user's reminder notification settings (demo defaults when unconfigured). */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const ctx = await getAuthedContext();
  if (!ctx) return DEFAULT_PREFERENCES;

  const { data } = await ctx.supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (!data) return DEFAULT_PREFERENCES;

  return {
    timezone: data.timezone,
    verseReminderEnabled: data.verse_reminder_enabled,
    verseReminderTime: data.verse_reminder_time,
    workoutReminderEnabled: data.workout_reminder_enabled,
    workoutReminderTime: data.workout_reminder_time,
  };
}

/** Whether the signed-in user has at least one push subscription registered. */
export async function hasPushSubscription(): Promise<boolean> {
  const ctx = await getAuthedContext();
  if (!ctx) return false;

  const { count } = await ctx.supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId);

  return Boolean(count);
}
