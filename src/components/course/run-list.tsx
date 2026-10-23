"use client";

import { useState, useTransition } from "react";
import { Flame, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateRun, deleteRun } from "@/app/(app)/course/actions";
import {
  durationToSeconds,
  paceSecPerKm,
  formatDuration,
  formatKm,
  formatPace,
  validateRun,
  RUN_KINDS,
} from "@/lib/running";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { Run, RunKind } from "@/types";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

function formatRunDate(iso: string, locale: LocaleCode): string {
  const tag = locale === "fr" ? "fr-CA" : "en-US";
  return new Date(iso + "T00:00:00").toLocaleDateString(tag, { weekday: "short", day: "numeric", month: "short" });
}

interface EditDraft { km: string; h: string; m: string; s: string; kind: RunKind; effort: string }

export function RunList({
  initial,
  dict,
  locale,
}: {
  initial: Run[];
  dict: Dictionary;
  locale: LocaleCode;
}) {
  const [runs, setRuns] = useState<Run[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const failMessage = (code?: string) =>
    (code && (dict[code as keyof Dictionary] as string)) || dict["course.error.generic"];

  function startEdit(r: Run) {
    setConfirmId(null);
    setError(null);
    setEditingId(r.id);
    setDraft({
      km: String(r.distanceM / 1000),
      h: String(Math.floor(r.durationS / 3600) || ""),
      m: String(Math.floor((r.durationS % 3600) / 60) || ""),
      s: String(r.durationS % 60 || ""),
      kind: r.kind,
      effort: r.effort ? String(r.effort) : "",
    });
  }

  function saveEdit(id: string) {
    if (!draft) return;
    const distanceM = Math.round((Number(draft.km) || 0) * 1000);
    const durationS = durationToSeconds(Number(draft.h), Number(draft.m), Number(draft.s));
    const local = validateRun(distanceM, durationS);
    if (!local.ok) {
      setError(failMessage(local.error));
      return;
    }
    const previous = runs.find((r) => r.id === id);
    const effort = draft.effort ? Math.min(10, Math.max(1, Number(draft.effort))) : undefined;
    const updated: Run = {
      ...(previous as Run),
      distanceM,
      durationS,
      paceSPerKm: paceSecPerKm(distanceM, durationS),
      kind: draft.kind,
      effort,
    };
    setRuns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setEditingId(null);
    setError(null);
    startTransition(async () => {
      const res = await updateRun({ id, distanceM, durationS, kind: draft.kind, effort });
      if (!res.ok) {
        if (previous) setRuns((prev) => prev.map((r) => (r.id === id ? previous : r)));
        setError(failMessage(res.error));
      }
    });
  }

  function remove(id: string) {
    const snapshot = runs;
    setRuns((prev) => prev.filter((r) => r.id !== id));
    setConfirmId(null);
    setError(null);
    startTransition(async () => {
      const res = await deleteRun(id);
      if (!res.ok) {
        setRuns(snapshot);
        setError(failMessage(res.error));
      }
    });
  }

  if (runs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">
        {dict["course.noRuns"]}
      </p>
    );
  }

  return (
    <div>
      {error && <p role="alert" className="mb-3 text-center text-sm text-ember">{error}</p>}
      <ul className="space-y-2">
        {runs.map((r) =>
          editingId === r.id && draft ? (
            <li key={r.id} className="rounded-lg border border-accent/30 bg-surface-2 p-3">
              <div className="space-y-2">
                <input
                  aria-label={dict["course.new.distanceKm"]}
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.km}
                  onChange={(e) => setDraft({ ...draft, km: e.target.value })}
                  className={inputClass}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input aria-label={dict["course.new.hours"]} placeholder={dict["course.new.hours"]} type="number" min={0} value={draft.h} onChange={(e) => setDraft({ ...draft, h: e.target.value })} className={inputClass} />
                  <input aria-label={dict["course.new.minutes"]} placeholder={dict["course.new.minutes"]} type="number" min={0} value={draft.m} onChange={(e) => setDraft({ ...draft, m: e.target.value })} className={inputClass} />
                  <input aria-label={dict["course.new.seconds"]} placeholder={dict["course.new.seconds"]} type="number" min={0} value={draft.s} onChange={(e) => setDraft({ ...draft, s: e.target.value })} className={inputClass} />
                </div>
                <select aria-label={dict["course.new.kind"]} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as RunKind })} className={inputClass}>
                  {RUN_KINDS.map((k) => (
                    <option key={k} value={k}>{dict[`course.kind.${k}` as keyof Dictionary] as string}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button type="button" size="sm" className="flex-1" onClick={() => saveEdit(r.id)}>
                    <Check className="size-4" /> {dict["course.saveRun"]}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                    {dict["common.cancel"]}
                  </Button>
                </div>
              </div>
            </li>
          ) : (
            <li
              key={r.id}
              data-testid="run-row"
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-medium">{formatKm(r.distanceM)} km</span>
                <span className="text-xs text-faint">{formatRunDate(r.ranOn, locale)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                <span>{formatDuration(r.durationS)}</span>
                <span className="flex items-center gap-1">
                  <Flame className="size-3.5 text-ember/70" />
                  {formatPace(r.paceSPerKm)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {confirmId === r.id ? (
                  <>
                    <span className="mr-1 hidden text-xs text-muted sm:inline">{dict["course.confirmDelete"]}</span>
                    <Button type="button" size="sm" variant="danger" onClick={() => remove(r.id)}>
                      {dict["course.deleteRun"]}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      aria-label={dict["common.cancel"]}
                      className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      aria-label={dict["course.editRunAria"]}
                      className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setConfirmId(r.id); setError(null); }}
                      aria-label={dict["course.deleteRunAria"]}
                      className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-ember"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
