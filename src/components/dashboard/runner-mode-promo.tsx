"use client";

import { useState } from "react";
import Link from "next/link";
import { Footprints, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";

const HIDE_KEY = "ka_runner_promo_hidden";

/**
 * Dashboard discovery card for users who haven't picked a primary activity yet.
 * "Try it" opens /course; "Hide" dismisses it (per-viewer, localStorage).
 */
export function RunnerModePromo({ dict }: { dict: Dictionary }) {
  const [hidden, setHidden] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(HIDE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (hidden) return null;

  function hide() {
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      // ignore
    }
    setHidden(true);
  }

  return (
    <Card className="mb-6 flex flex-col gap-4 bg-gradient-to-br from-accent/12 to-surface sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-bright">
          <Footprints className="size-5" />
        </span>
        <div>
          <h3 className="font-serif text-lg font-semibold">{dict["course.promoTitle"]}</h3>
          <p className="text-sm text-muted">{dict["course.promoBody"]}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/course" className={cn(buttonVariants({ size: "sm" }))}>
          {dict["course.promoTry"]}
        </Link>
        <Button type="button" size="sm" variant="ghost" onClick={hide}>
          <X className="size-4" /> {dict["course.promoHide"]}
        </Button>
      </div>
    </Card>
  );
}
