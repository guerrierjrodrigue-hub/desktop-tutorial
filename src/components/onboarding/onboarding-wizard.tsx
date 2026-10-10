"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  IDENTITY_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  LEVEL_OPTIONS,
  EQUIPMENT_OPTIONS,
} from "@/lib/personalization";
import { saveOnboarding } from "@/app/onboarding/actions";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, type LocaleCode } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { IdentityId } from "@/types";

const TOTAL_STEPS = 5;
const DAY_OPTIONS = [2, 3, 4, 5, 6];

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
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [equipment, setEquipment] = useState<"none" | "home" | "gym">("home");
  const [trainingDays, setTrainingDays] = useState(3);
  const [reminderTime, setReminderTime] = useState("07:00");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState(false);
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
    setAgeError(false);
    startTransition(async () => {
      const result = await saveOnboarding({
        goals,
        identities,
        level,
        equipment,
        trainingDays,
        reminderTime,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        birthDate: birthDate || null,
      });
      if (result && !result.ok && result.error === "age") {
        setAgeError(true);
        setSaving(false);
        setStep(3);
        return;
      }
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
                      ? "border-accent/50 bg-accent/10 text-foreground"
                      : "border-border bg-surface-2 text-muted hover:border-accent/30",
                  )}
                >
                  {l.nativeLabel}
                  {language === l.code && <Check className="size-4 shrink-0 text-accent-bright" />}
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
                        ? "border-accent/50 bg-accent/10 text-foreground"
                        : "border-border bg-surface-2 text-muted hover:border-accent/30",
                    )}
                  >
                    {dict[option.labelKey]}
                    {selected && <Check className="size-4 shrink-0 text-accent-bright" />}
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
              {dict["onboarding.trainingTitle"]}
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              {dict["onboarding.trainingSubtitle"]}
            </p>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">{dict["onboarding.levelLabel"]}</p>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setLevel(o.id)}
                      aria-pressed={level === o.id}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition",
                        level === o.id
                          ? "border-accent/50 bg-accent/10 text-foreground"
                          : "border-border bg-surface-2 text-muted hover:border-accent/30",
                      )}
                    >
                      {dict[o.labelKey]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">{dict["onboarding.equipmentLabel"]}</p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setEquipment(o.id)}
                      aria-pressed={equipment === o.id}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition",
                        equipment === o.id
                          ? "border-accent/50 bg-accent/10 text-foreground"
                          : "border-border bg-surface-2 text-muted hover:border-accent/30",
                      )}
                    >
                      {dict[o.labelKey]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-muted" htmlFor="ob-days">
                  {dict["onboarding.daysLabel"]}
                </label>
                <select
                  id="ob-days"
                  value={trainingDays}
                  onChange={(e) => setTrainingDays(Number(e.target.value))}
                  className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40"
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-muted" htmlFor="ob-reminder">
                  {dict["onboarding.reminderLabel"]}
                </label>
                <input
                  id="ob-reminder"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40"
                />
              </div>

              <details className="rounded-xl border border-border bg-surface-2 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-muted">
                  {dict["onboarding.optionalMetrics"]}
                </summary>
                <p className="mt-2 text-xs text-faint">{dict["onboarding.whyWeAsk"]}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder={dict["onboarding.heightCm"]}
                    aria-label={dict["onboarding.heightCm"]}
                    className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/40"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder={dict["onboarding.weightKg"]}
                    aria-label={dict["onboarding.weightKg"]}
                    className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/40"
                  />
                  <label className="col-span-2 flex items-center justify-between gap-2 text-xs text-muted">
                    {dict["onboarding.birthDate"]}
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      aria-label={dict["onboarding.birthDate"]}
                      className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/40"
                    />
                  </label>
                </div>
                {ageError && <p className="mt-2 text-xs text-danger">{dict["onboarding.ageError"]}</p>}
              </details>
            </div>
          </>
        )}

        {step === 4 && (
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
