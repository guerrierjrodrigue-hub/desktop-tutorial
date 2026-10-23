"use client";

import { useState, useTransition } from "react";
import { Footprints, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { setPrimaryActivity } from "@/app/(app)/profile/actions";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";

type Activity = "strength" | "running" | "both";

export function ActivitySetting({
  dict,
  initial,
}: {
  dict: Dictionary;
  initial?: Activity;
}) {
  const [value, setValue] = useState<Activity | undefined>(initial);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  const options: [Activity, string][] = [
    ["strength", dict["onboarding.activityStrength"]],
    ["running", dict["onboarding.activityRunning"]],
    ["both", dict["onboarding.activityBoth"]],
  ];

  function choose(next: Activity) {
    setValue(next);
    setSaved(false);
    startTransition(async () => {
      const res = await setPrimaryActivity(next);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Footprints className="size-4 text-accent/80" /> {dict["course.activityTitle"]}
          </span>
        </CardTitle>
        {saved && (
          <span role="status" className="flex items-center gap-1 text-xs text-green-bright">
            <Check className="size-3.5" /> {dict["course.activitySaved"]}
          </span>
        )}
      </CardHeader>
      <div className="flex flex-wrap gap-2">
        {options.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            aria-pressed={value === id}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              value === id
                ? "border-accent/50 bg-accent/10 text-foreground"
                : "border-border bg-surface-2 text-muted hover:border-accent/30",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </Card>
  );
}
