"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Footprints } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setPrimaryActivity } from "@/app/(app)/profile/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Shown when an account opens the other mode's home (a strength account on
 * /course, or a running account on /fitness). Activating adds the mode
 * (primary_activity becomes "both") without touching any existing data, then
 * refreshes so the menu and page update.
 */
export function ActivateMode({ dict, activate }: { dict: Dictionary; activate: "running" | "strength" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const Icon = activate === "running" ? Footprints : Dumbbell;
  const titleKey = activate === "running" ? "activity.activateRunning.title" : "activity.activateStrength.title";
  const bodyKey = activate === "running" ? "activity.activateRunning.body" : "activity.activateStrength.body";
  const buttonKey = activate === "running" ? "activity.activateRunning.button" : "activity.activateStrength.button";

  function enable() {
    // Adding a mode keeps the other one: strength + running = "both".
    startTransition(async () => {
      const res = await setPrimaryActivity("both");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
      <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-accent/12 text-accent-bright">
        <Icon className="size-7" />
      </span>
      <Card className="text-left">
        <h1 className="font-serif text-2xl font-semibold">{dict[titleKey]}</h1>
        <p className="mt-2 text-sm text-muted">{dict[bodyKey]}</p>
        <Button type="button" className="mt-5 w-full" onClick={enable} disabled={pending}>
          {dict[buttonKey]}
        </Button>
      </Card>
    </div>
  );
}
