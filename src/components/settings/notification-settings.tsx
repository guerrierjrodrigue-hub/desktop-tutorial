"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, BookOpen, Dumbbell } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  savePushSubscription,
  saveNotificationPreferences,
} from "@/app/(app)/profile/notification-actions";
import type { NotificationPreferences } from "@/types";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type PushSupport = "checking" | "unsupported" | "denied" | "granted" | "default";

export function NotificationSettings({
  initial,
  hasSubscription,
  dict,
  vapidPublicKey,
}: {
  initial: NotificationPreferences;
  hasSubscription: boolean;
  dict: Dictionary;
  vapidPublicKey: string;
}) {
  // Starts as "checking" on both server and the client's first paint (so
  // hydration matches), then resolves to the real browser support/permission
  // state once mounted — this can only be known client-side.
  const [support, setSupport] = useState<PushSupport>("checking");
  const [subscribed, setSubscribed] = useState(hasSubscription);
  const [enabling, setEnabling] = useState(false);
  const [verseEnabled, setVerseEnabled] = useState(initial.verseReminderEnabled);
  const [verseTime, setVerseTime] = useState(initial.verseReminderTime ?? "07:00");
  const [workoutEnabled, setWorkoutEnabled] = useState(initial.workoutReminderEnabled);
  const [workoutTime, setWorkoutTime] = useState(initial.workoutReminderTime ?? "17:00");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const next: PushSupport =
      !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)
        ? "unsupported"
        : Notification.permission === "granted"
          ? "granted"
          : Notification.permission === "denied"
            ? "denied"
            : "default";
    // Resolved post-mount on purpose — matches the SSR-safe "checking" default above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupport(next);
  }, []);

  async function enableNotifications() {
    if (!vapidPublicKey) return;
    setEnabling(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      setSupport(permission === "granted" ? "granted" : permission === "denied" ? "denied" : "default");
      if (permission !== "granted") return;

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        }));

      const json = subscription.toJSON();
      await savePushSubscription({
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      });
      setSubscribed(true);
    } finally {
      setEnabling(false);
    }
  }

  function persist(next: Partial<NotificationPreferences>) {
    const merged = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      verseReminderEnabled: verseEnabled,
      verseReminderTime: verseTime,
      workoutReminderEnabled: workoutEnabled,
      workoutReminderTime: workoutTime,
      ...next,
    };
    startTransition(() => {
      void saveNotificationPreferences(merged);
    });
  }

  const canEnable = support === "default" || support === "granted";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Bell className="size-4" /> {dict["reminders.title"]}
          </span>
        </CardTitle>
      </CardHeader>
      <p className="text-sm text-muted">{dict["reminders.subtitle"]}</p>

      {support === "unsupported" && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
          <BellOff className="size-4 shrink-0" /> {dict["reminders.unsupported"]}
        </p>
      )}

      {support === "denied" && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <BellOff className="size-4 shrink-0" /> {dict["reminders.blocked"]}
        </p>
      )}

      {canEnable && !subscribed && (
        <Button className="mt-4" onClick={enableNotifications} disabled={enabling}>
          <Bell className="size-4" />
          {enabling ? dict["common.loading"] : dict["reminders.enable"]}
        </Button>
      )}

      {subscribed && (
        <div className="mt-4 space-y-4">
          <ReminderRow
            icon={BookOpen}
            label={dict["reminders.verseReminder"]}
            enabled={verseEnabled}
            time={verseTime}
            onToggle={(v) => {
              setVerseEnabled(v);
              persist({ verseReminderEnabled: v });
            }}
            onTimeChange={(t) => {
              setVerseTime(t);
              persist({ verseReminderTime: t });
            }}
          />
          <ReminderRow
            icon={Dumbbell}
            label={dict["reminders.workoutReminder"]}
            enabled={workoutEnabled}
            time={workoutTime}
            onToggle={(v) => {
              setWorkoutEnabled(v);
              persist({ workoutReminderEnabled: v });
            }}
            onTimeChange={(t) => {
              setWorkoutTime(t);
              persist({ workoutReminderTime: t });
            }}
          />
        </div>
      )}
    </Card>
  );
}

function ReminderRow({
  icon: Icon,
  label,
  enabled,
  time,
  onToggle,
  onTimeChange,
}: {
  icon: typeof Bell;
  label: string;
  enabled: boolean;
  time: string;
  onToggle: (v: boolean) => void;
  onTimeChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        aria-pressed={enabled}
        className="flex items-center gap-2.5 text-left text-sm font-medium"
      >
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full transition",
            enabled ? "bg-gold/15 text-gold-bright" : "bg-elevated text-faint",
          )}
        >
          <Icon className="size-4" />
        </span>
        {label}
      </button>
      <input
        type="time"
        value={time}
        disabled={!enabled}
        onChange={(e) => onTimeChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-surface px-2 text-sm outline-none disabled:opacity-40"
      />
    </div>
  );
}
