"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Footprints, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { setPrimaryActivity } from "@/app/(app)/profile/actions";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ActivityMode } from "@/lib/activity";

/**
 * Shown on the dashboard for accounts that have not chosen an activity mode yet.
 * Picking one updates primary_activity and refreshes, so the menu and the rest
 * of the dashboard adapt immediately.
 */
export function ChooseModeCard({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function choose(mode: ActivityMode) {
    startTransition(async () => {
      const res = await setPrimaryActivity(mode);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <Card className="bg-gradient-to-br from-accent/12 to-surface">
      <CardHeader>
        <CardTitle>{dict["dashboard.chooseMode.title"]}</CardTitle>
      </CardHeader>
      <p className="text-sm text-muted">{dict["dashboard.chooseMode.body"]}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => choose("running")}
          disabled={pending}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/40 disabled:opacity-60",
          )}
        >
          <Footprints className="size-5 text-accent-bright" />
          {dict["onboarding.activityRunning"]}
        </button>
        <button
          type="button"
          onClick={() => choose("strength")}
          disabled={pending}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm font-medium transition hover:border-accent/40 disabled:opacity-60"
        >
          <Dumbbell className="size-5 text-accent-bright" />
          {dict["onboarding.activityStrength"]}
        </button>
      </div>
      <button
        type="button"
        onClick={() => choose("both")}
        disabled={pending}
        className="mt-2 w-full rounded-xl px-4 py-2 text-sm text-muted underline-offset-2 transition hover:text-foreground hover:underline disabled:opacity-60"
      >
        {dict["onboarding.activityBoth"]}
      </button>
      {saved && (
        <p role="status" className="mt-2 flex items-center justify-center gap-1 text-sm text-green-bright">
          <Check className="size-4" /> {dict["dashboard.chooseMode.saved"]}
        </p>
      )}
    </Card>
  );
}
