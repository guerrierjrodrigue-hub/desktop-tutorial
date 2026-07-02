"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { advanceReadingPlan } from "@/app/(app)/spiritual/actions";
import type { ReadingPlan } from "@/types";

export function ReadingPlans({ initial }: { initial: ReadingPlan[] }) {
  const [plans, setPlans] = useState(initial);
  const [, startTransition] = useTransition();

  function advance(id: string) {
    let target = 0;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        target = Math.min(p.completedDays + 1, p.totalDays);
        return { ...p, completedDays: target };
      }),
    );
    startTransition(async () => {
      await advanceReadingPlan(id, target);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading plans</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {plans.map((plan) => {
          const done = plan.completedDays >= plan.totalDays;
          return (
            <div
              key={plan.id}
              className="rounded-xl border border-border bg-surface-2 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif font-semibold leading-tight">
                    {plan.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">{plan.description}</p>
                </div>
                {done && (
                  <Badge variant="green">
                    <CheckCircle2 className="size-3" /> Done
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <Progress value={plan.completedDays / plan.totalDays} />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted">
                    {plan.completedDays}/{plan.totalDays} days
                  </p>
                  {!done && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => advance(plan.id)}
                      className="h-7 px-3 text-xs"
                    >
                      <BookOpen className="size-3.5" /> Log today
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
