"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Dumbbell, Footprints } from "lucide-react";
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
import { track, EVENTS } from "@/lib/analytics";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { IdentityId, RunGoalKind, RunLevel } from "@/types";

type ActivityMode = "strength" | "running" | "both";
type StepId = "mode" | "run" | "goals" | "training" | "spiritual" | "summary";

const DAY_OPTIONS = [2, 3, 4, 5, 6];
const RUN_LEVELS: RunLevel[] = ["new", "5k", "10k"];
const RUN_GOALS: RunGoalKind[] = ["5k", "10k", "half", "free"];

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

  // Reaching onboarding is the first screen after signing up. Fire the signup
  // event once per browser, so it is not re-counted on later visits.
  useEffect(() => {
    try {
      if (localStorage.getItem("ka_signed_up") === "1") return;
      localStorage.setItem("ka_signed_up", "1");
    } catch {
      return;
    }
    track(EVENTS.signedUp);
  }, []);

  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<LocaleCode>(locale);
  // Mode is the very first choice and has no default, so the user must pick.
  const [mode, setMode] = useState<ActivityMode | null>(null);
  const [goals, setGoals] = useState<string[]>(initialGoals ?? []);
  const [identities, setIdentities] = useState<string[]>(initialIdentities ?? []);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [equipment, setEquipment] = useState<"none" | "home" | "gym">("home");
  const [trainingDays, setTrainingDays] = useState(3);
  const [runLevel, setRunLevel] = useState<RunLevel | null>(null);
  const [runGoal, setRunGoal] = useState<RunGoalKind | null>(null);
  const [favoriteVerse, setFavoriteVerse] = useState("");
  const [reminderTime, setReminderTime] = useState("07:00");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const showStrength = mode === "strength" || mode === "both";
  const showRunning = mode === "running" || mode === "both";

  // The step order is built from the chosen mode: mode first, then the
  // mode-specific questions, then the common spiritual step and the summary.
  const steps: StepId[] = ["mode"];
  if (showRunning) steps.push("run");
  if (showStrength) steps.push("goals", "training");
  steps.push("spiritual", "summary");
  const total = steps.length;
  const current = steps[Math.min(step, total - 1)];

  function chooseLanguage(code: LocaleCode) {
    setLanguage(code);
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  function chooseMode(next: ActivityMode) {
    setMode(next);
    setStep(1);
  }

  function toggleGoal(id: string) {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  function toggleIdentity(id: IdentityId) {
    setIdentities((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function finish() {
    setSaving(true);
    setAgeError(false);
    startTransition(async () => {
      const result = await saveOnboarding({
        goals: showStrength ? goals : [],
        identities,
        favoriteVerse: favoriteVerse || undefined,
        reminderTime,
        primaryActivity: mode ?? undefined,
        ...(showStrength ? { level, equipment, trainingDays } : {}),
        ...(showRunning && runLevel ? { runLevel } : {}),
        ...(showRunning && runGoal ? { runGoalKind: runGoal } : {}),
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        birthDate: birthDate || null,
      });
      if (result && !result.ok && result.error === "age") {
        setAgeError(true);
        setSaving(false);
        setStep(steps.indexOf("spiritual"));
        return;
      }
      track(EVENTS.onboardingCompleted, { primaryActivity: mode ?? "unset" });
      router.push("/dashboard");
    });
  }

  const canContinue =
    current === "mode"
      ? mode !== null
      : current === "run"
        ? Boolean(runLevel && runGoal)
        : current === "goals"
          ? goals.length > 0
          : current === "spiritual"
            ? identities.length > 0
            : true;

  const choice = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm transition",
      active
        ? "border-accent/50 bg-accent/10 text-foreground"
        : "border-border bg-surface-2 text-muted hover:border-accent/30",
    );

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 flex items-center justify-center gap-2.5">
        <Logo variant="mark" height={30} />
        <Logo variant="inline" height={20} className="text-foreground" />
      </div>

      {/* Compact language toggle, available on every step. */}
      <div className="mb-6 flex justify-center gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => chooseLanguage(l.code)}
            aria-pressed={language === l.code}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              language === l.code
                ? "border-accent/50 bg-accent/10 text-foreground"
                : "border-border bg-surface-2 text-muted hover:border-accent/30",
            )}
          >
            {l.nativeLabel}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Progress value={(step + 1) / total} />
        <p className="mt-2 text-center text-xs text-faint">
          {dict["onboarding.step"]} {step + 1} {dict["onboarding.of"]} {total}
        </p>
      </div>

      <div className="glass rounded-3xl border border-border p-6 sm:p-8">
        {current === "mode" && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">{dict["onboarding.modeTitle"]}</h1>
            <p className="mt-2 text-center text-sm text-muted">{dict["onboarding.modeSubtitle"]}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseMode("running")}
                aria-pressed={mode === "running"}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition",
                  mode === "running"
                    ? "border-accent/60 bg-accent/10"
                    : "border-border bg-surface-2 hover:border-accent/30",
                )}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-accent/12 text-accent-bright">
                  <Footprints className="size-5" />
                </span>
                <span className="font-serif text-lg font-semibold">{dict["onboarding.modeRunningTitle"]}</span>
                <span className="text-sm text-muted">{dict["onboarding.modeRunningDesc"]}</span>
              </button>
              <button
                type="button"
                onClick={() => chooseMode("strength")}
                aria-pressed={mode === "strength"}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition",
                  mode === "strength"
                    ? "border-accent/60 bg-accent/10"
                    : "border-border bg-surface-2 hover:border-accent/30",
                )}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-accent/12 text-accent-bright">
                  <Dumbbell className="size-5" />
                </span>
                <span className="font-serif text-lg font-semibold">{dict["onboarding.modeStrengthTitle"]}</span>
                <span className="text-sm text-muted">{dict["onboarding.modeStrengthDesc"]}</span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => chooseMode("both")}
                aria-pressed={mode === "both"}
                className={cn(
                  "text-sm underline-offset-2 transition hover:underline",
                  mode === "both" ? "text-accent-bright" : "text-muted hover:text-foreground",
                )}
              >
                {dict["onboarding.modeBoth"]}
              </button>
            </div>
          </>
        )}

        {current === "run" && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">{dict["onboarding.runTitle"]}</h1>
            <p className="mt-2 text-center text-sm text-muted">{dict["onboarding.runSubtitle"]}</p>
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium">{dict["course.start.levelQ"]}</legend>
              <div className="flex flex-wrap gap-2">
                {RUN_LEVELS.map((l) => (
                  <button key={l} type="button" aria-pressed={runLevel === l} onClick={() => setRunLevel(l)} className={choice(runLevel === l)}>
                    {dict[`course.start.level.${l}` as keyof Dictionary] as string}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-medium">{dict["course.start.goalQ"]}</legend>
              <div className="flex flex-wrap gap-2">
                {RUN_GOALS.map((g) => (
                  <button key={g} type="button" aria-pressed={runGoal === g} onClick={() => setRunGoal(g)} className={choice(runGoal === g)}>
                    {dict[`course.start.goal.${g}` as keyof Dictionary] as string}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {current === "goals" && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">{dict["onboarding.goalTitle"]}</h1>
            <p className="mt-2 text-center text-sm text-muted">{dict["onboarding.goalSubtitle"]}</p>
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

        {current === "training" && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">{dict["onboarding.trainingTitle"]}</h1>
            <p className="mt-2 text-center text-sm text-muted">{dict["onboarding.trainingSubtitle"]}</p>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">{dict["onboarding.levelLabel"]}</p>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((o) => (
                    <button key={o.id} type="button" onClick={() => setLevel(o.id)} aria-pressed={level === o.id} className={choice(level === o.id)}>
                      {dict[o.labelKey]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">{dict["onboarding.equipmentLabel"]}</p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((o) => (
                    <button key={o.id} type="button" onClick={() => setEquipment(o.id)} aria-pressed={equipment === o.id} className={choice(equipment === o.id)}>
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
            </div>
          </>
        )}

        {current === "spiritual" && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">{dict["onboarding.spiritualTitle"]}</h1>
            <p className="mt-2 text-center text-sm text-muted">{dict["onboarding.spiritualSubtitle"]}</p>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">{dict["onboarding.identityTitle"]}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="ob-verse">
                  {dict["onboarding.favoriteVerseLabel"]}
                </label>
                <input
                  id="ob-verse"
                  type="text"
                  value={favoriteVerse}
                  onChange={(e) => setFavoriteVerse(e.target.value)}
                  placeholder={dict["onboarding.favoriteVersePlaceholder"]}
                  className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40"
                />
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

        {current === "summary" && (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">{dict["onboarding.summaryTitle"]}</h1>
            <p className="mt-2 text-center text-sm text-muted">{dict["onboarding.summarySubtitle"]}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <p className="text-xs text-faint">{dict["onboarding.summaryModeLabel"]}</p>
                <p className="font-medium">
                  {mode === "running"
                    ? dict["onboarding.activityRunning"]
                    : mode === "strength"
                      ? dict["onboarding.activityStrength"]
                      : dict["onboarding.activityBoth"]}
                </p>
              </div>
              {showStrength && goals.length > 0 && (
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
              )}
              {identities.length > 0 && (
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
              )}
              <p className="text-center text-sm text-muted">{dict["onboarding.planReady"]}</p>
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="size-4" /> {dict["onboarding.back"]}
          </Button>
          {step < total - 1 ? (
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
