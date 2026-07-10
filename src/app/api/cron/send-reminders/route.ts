import { NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { getDailyDevotional } from "@/data/devotional";
import { getQuoteOfDay } from "@/lib/quote-of-day";
import { isLocaleCode, DEFAULT_LOCALE } from "@/i18n/locales";
import type { NotificationPreferencesRow, PushSubscriptionRow } from "@/types/database";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:hello@kingdomathlete.app";

/** How far past a user's target minute the cron will still fire (covers gaps between cron ticks). */
const TOLERANCE_MINUTES = 20;

function localTimeParts(date: Date, timeZone: string): { hhmm: string; dateStr: string } {
  const hhmm = (() => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(date);
      const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
      const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
      return `${hour}:${minute}`;
    } catch {
      return "00:00";
    }
  })();
  const dateStr = (() => {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  })();
  return { hhmm, dateStr };
}

function minutesSinceMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Whether `nowHHMM` is at or up to TOLERANCE_MINUTES past `targetHHMM`. */
function isDue(targetHHMM: string | null, nowHHMM: string): boolean {
  if (!targetHHMM) return false;
  const target = minutesSinceMidnight(targetHHMM);
  const now = minutesSinceMidnight(nowHHMM);
  return now >= target && now - target <= TOLERANCE_MINUTES;
}

async function sendPush(
  sub: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string },
): Promise<{ ok: boolean; gone: boolean }> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return { ok: true, gone: false };
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    return { ok: false, gone: status === 404 || status === 410 };
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminClientConfigured() || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ skipped: "notifications-unconfigured" });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const admin = createSupabaseAdminClient();
  const now = new Date();

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("*")
    .or("verse_reminder_enabled.eq.true,workout_reminder_enabled.eq.true");

  const rows = (prefs ?? []) as NotificationPreferencesRow[];
  let verseSent = 0;
  let workoutSent = 0;
  let staleRemoved = 0;

  for (const pref of rows) {
    const { hhmm, dateStr } = localTimeParts(now, pref.timezone || "UTC");
    const locale = isLocaleCode(pref.locale) ? pref.locale : DEFAULT_LOCALE;

    const dueVerse =
      pref.verse_reminder_enabled &&
      pref.last_verse_sent_date !== dateStr &&
      isDue(pref.verse_reminder_time, hhmm);
    const dueWorkout =
      pref.workout_reminder_enabled &&
      pref.last_workout_sent_date !== dateStr &&
      isDue(pref.workout_reminder_time, hhmm);

    if (!dueVerse && !dueWorkout) continue;

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", pref.user_id);
    const subscriptions = (subs ?? []) as PushSubscriptionRow[];
    if (subscriptions.length === 0) continue;

    if (dueVerse) {
      const dayOfYear = Math.floor(
        (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
          Date.UTC(now.getUTCFullYear(), 0, 0)) /
          86_400_000,
      );
      const useVerse = dayOfYear % 2 === 0;
      const quote = getQuoteOfDay(locale, now);
      const devotional = getDailyDevotional(locale, now);
      const body = useVerse ? `"${devotional.verse.text}" — ${devotional.verse.reference}` : quote;

      for (const sub of subscriptions) {
        const result = await sendPush(sub, {
          title: locale === "fr" ? "Ton encouragement du jour 🙏" : "Today's encouragement 🙏",
          body,
          url: "/dashboard",
        });
        if (result.gone) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
          staleRemoved++;
        }
      }
      await admin
        .from("notification_preferences")
        .update({ last_verse_sent_date: dateStr })
        .eq("user_id", pref.user_id);
      verseSent++;
    }

    if (dueWorkout) {
      for (const sub of subscriptions) {
        const result = await sendPush(sub, {
          title: locale === "fr" ? "C'est l'heure de s'entraîner 💪" : "Time to train 💪",
          body:
            locale === "fr"
              ? "Ton entraînement du jour t'attend — garde ta série en vie."
              : "Your workout is waiting — keep the streak alive.",
          url: "/fitness",
        });
        if (result.gone) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
          staleRemoved++;
        }
      }
      await admin
        .from("notification_preferences")
        .update({ last_workout_sent_date: dateStr })
        .eq("user_id", pref.user_id);
      workoutSent++;
    }
  }

  return NextResponse.json({ checked: rows.length, verseSent, workoutSent, staleRemoved });
}
