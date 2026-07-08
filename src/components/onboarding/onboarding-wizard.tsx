"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IDENTITY_OPTIONS, PRIMARY_GOAL_OPTIONS } from "@/lib/personalization";
import { saveOnboarding } from "@/app/onboarding/actions";
import { cn } from "@/lib/utils";
import type { IdentityId } from "@/types";

export function OnboardingWizard({
  initialGoal,
  initialIdentities,
}: {
  initialGoal?: string;
  initialIdentities?: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(initialGoal ?? "");
  const [identities, setIdentities] = useState<string[]>(initialIdentities ?? []);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function toggleIdentity(id: IdentityId) {
    setIdentities((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function finish() {
    setSaving(true);
    startTransition(async () => {
      await saveOnboarding({ goal, identities });
      router.push("/dashboard");
    });
  }

  const canContinue =
    step === 0 ? Boolean(goal) : step === 1 ? identities.length > 0 : true;

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <div className="mb-6">
        <Progress value={(step + 1) / 3} />
        <p className="mt-2 text-center text-xs text-faint">Step {step + 1} of 3</p>
      </div>

      <div className="glass rounded-3xl border border-border p-6 sm:p-8">
        {step === 0 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              What is your primary goal?
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              We&apos;ll shape your daily rhythm around this.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRIMARY_GOAL_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGoal(option)}
                  aria-pressed={goal === option}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                    goal === option
                      ? "border-gold/50 bg-gold/10 text-foreground"
                      : "border-border bg-surface-2 text-muted hover:border-gold/30",
                  )}
                >
                  {option}
                  {goal === option && <Check className="size-4 shrink-0 text-gold-bright" />}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              Who do you want to become?
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              Pick as many as resonate — the app adapts to each one.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {IDENTITY_OPTIONS.map((option) => {
                const selected = identities.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleIdentity(option.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center text-sm font-medium transition",
                      selected
                        ? "border-green-bright/50 bg-green/10 text-foreground"
                        : "border-border bg-surface-2 text-muted hover:border-green-bright/30",
                    )}
                  >
                    {selected && <Check className="size-4 text-green-bright" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              You&apos;re all set
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              Here&apos;s the journey we&apos;re building for you.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-xs text-faint">Primary goal</p>
                <p className="font-medium">{goal}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-xs text-faint">Identities</p>
                <p className="font-medium">
                  {identities
                    .map((id) => IDENTITY_OPTIONS.find((o) => o.id === id)?.label)
                    .join(", ")}
                </p>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              Continue <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving}>
              Enter Kingdom Athlete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
