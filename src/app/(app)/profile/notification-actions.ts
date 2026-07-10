"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getLocale } from "@/lib/locale";
import { type ActionResult, demoOk } from "@/lib/actions/result";

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Registers a browser's push subscription for the signed-in user. */
export async function savePushSubscription(input: PushSubscriptionInput): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: ctx.userId, endpoint: input.endpoint, p256dh: input.p256dh, auth: input.auth },
      { onConflict: "endpoint" },
    );
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

/** Removes a browser's push subscription (e.g. when the user disables notifications). */
export async function removePushSubscription(endpoint: string): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  await ctx.supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { ok: true };
}

export interface NotificationPreferencesInput {
  timezone: string;
  verseReminderEnabled: boolean;
  verseReminderTime: string | null;
  workoutReminderEnabled: boolean;
  workoutReminderTime: string | null;
}

/** Saves the signed-in user's reminder times and locale for the notification cron. */
export async function saveNotificationPreferences(
  input: NotificationPreferencesInput,
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const locale = await getLocale();

  const { error } = await ctx.supabase.from("notification_preferences").upsert(
    {
      user_id: ctx.userId,
      locale,
      timezone: input.timezone || "UTC",
      verse_reminder_enabled: input.verseReminderEnabled,
      verse_reminder_time: input.verseReminderTime,
      workout_reminder_enabled: input.workoutReminderEnabled,
      workout_reminder_time: input.workoutReminderTime,
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}
