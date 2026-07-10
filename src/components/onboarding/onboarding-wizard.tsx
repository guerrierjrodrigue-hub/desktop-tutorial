"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IDENTITY_OPTIONS, PRIMARY_GOAL_OPTIONS } from "@/lib/personalization";
import { saveOnboarding } from "@/app/onboarding/actions";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, type LocaleCode } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { IdentityId } from "@/types";

const TOTAL_STEPS = 4;

export function OnboardingWizard({
  locale,
  dict,
  initialGoals,
  initialIdentities,
}: {
  locale: LocaleCode;
  dict: Dictionary;
  initialGoals?: string[];
  initialIdentities?: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<LocaleCode>(locale);
  const [goals, setGoals] = useState<string[]>(initialGoals ?? []);
  const [identities, setIdentities] = useState<string[]>(initialIdentities ?? []);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function chooseLanguage(code: LocaleCode) {
    setLanguage(code);
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  function toggleGoal(id: string) {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  function toggleIdentity(id: IdentityId) {
    setIdentities((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function finish() {
    setSaving(true);
    startTransition(async () => {
      await saveOnboarding({ goals, identities });
      router.push("/dashboard");
    });
  }

  const canContinue =
    step === 0 ? Boolean(language) : step === 1 ? goals.length > 0 : step === 2 ? identities.length > 0 : true;

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <div className="mb-6">
        <Progress value={(step + 1) / TOTAL_STEPS} />
        <p className="mt-2 text-center text-xs text-faint">
          {dict["onboarding.step"]} {step + 1} {dict["onboarding.of"]} {TOTAL_STEPS}
        </p>
      </div>

      <div className="glass rounded-3xl border border-border p-6 sm:p-8">
        {step === 0 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              {dict["onboarding.languageTitle"]}
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              {dict["onboarding.languageSubtitle"]}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => chooseLanguage(l.code)}
                  aria-pressed={language === l.code}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                    language === l.code
                      ? "border-gold/50 bg-gold/10 text-foreground"
                      : "border-border bg-surface-2 text-muted hover:border-gold/30",
                  )}
                >
                  {l.nativeLabel}
                  {language === l.code && <Check className="size-4 shrink-0 text-gold-bright" />}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              {dict["onboarding.goalTitle"]}
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              {dict["onboarding.goalSubtitle"]}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRIMARY_GOAL_OPTIONS.map((option) => {
                const selected = goals.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleGoal(option.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                      selected
                        ? "border-gold/50 bg-gold/10 text-foreground"
                        : "border-border bg-surface-2 text-muted hover:border-gold/30",
                    )}
                  >
                    {dict[option.labelKey]}
                    {selected && <Check className="size-4 shrink-0 text-gold-bright" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              {dict["onboarding.identityTitle"]}
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              {dict["onboarding.identitySubtitle"]}
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
                    {dict[option.labelKey]}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">
              {dict["onboarding.summaryTitle"]}
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              {dict["onboarding.summarySubtitle"]}
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-xs text-faint">{dict["onboarding.primaryGoalLabel"]}</p>
                <p className="font-medium">
                  {goals
                    .map((id) => {
                      const option = PRIMARY_GOAL_OPTIONS.find((o) => o.id === id);
                      return option ? dict[option.labelKey] : id;
                    })
                    .join(", ")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-xs text-faint">{dict["onboarding.identitiesLabel"]}</p>
                <p className="font-medium">
                  {identities
                    .map((id) => {
                      const option = IDENTITY_OPTIONS.find((o) => o.id === id);
                      return option ? dict[option.labelKey] : id;
                    })
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
            <ChevronLeft className="size-4" /> {dict["onboarding.back"]}
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              {dict["common.continue"]} <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving}>
              {dict["onboarding.enterApp"]}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
