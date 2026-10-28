"use client";

import { useState, useTransition } from "react";
import { Check, Share2, NotebookPen, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createRun } from "@/app/(app)/course/actions";
import { createJournalEntry } from "@/app/(app)/journal/actions";
import { signedRunImageUrl } from "@/lib/actions/share";
import { track, EVENTS } from "@/lib/analytics";
import { showXp } from "@/components/gamification/xp-toast";
import {
  durationToSeconds,
  paceSecPerKm,
  formatPace,
  formatDuration,
  formatKm,
  validateRun,
  validateRunDate,
  runEarnsXp,
  MAX_RUN_AGE_DAYS,
  RUN_KINDS,
} from "@/lib/running";
import { addDaysToDateStr } from "@/lib/date";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Run, RunKind, Shoe } from "@/types";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

export function NewRunForm({
  dict,
  today,
  shoes = [],
}: {
  dict: Dictionary;
  today: string;
  shoes?: Shoe[];
}) {
  const [date, setDate] = useState(today);
  const [km, setKm] = useState("");
  const [h, setH] = useState("");
  const [m, setM] = useState("");
  const [s, setS] = useState("");
  const [kind, setKind] = useState<RunKind>("easy");
  const [effort, setEffort] = useState("");
  const [note, setNote] = useState("");
  const [shoeId, setShoeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Run[]>([]);
  const [journalDone, setJournalDone] = useState(false);
  const [noXpNote, setNoXpNote] = useState(false);
  const [pending, startTransition] = useTransition();

  const distanceM = Math.round((Number(km) || 0) * 1000);
  const durationS = durationToSeconds(Number(h), Number(m), Number(s));
  const livePace = paceSecPerKm(distanceM, durationS);
  const minDate = addDaysToDateStr(today, -MAX_RUN_AGE_DAYS);

  const canSubmit = distanceM > 0 && durationS > 0 && !pending;

  const failMessage = (code?: string) =>
    (code && (dict[code as keyof Dictionary] as string)) || dict["course.error.generic"];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const local = validateRun(distanceM, durationS);
    if (!local.ok) {
      setError(failMessage(local.error));
      return;
    }
    const localDate = validateRunDate(date, today);
    if (!localDate.ok) {
      setError(failMessage(localDate.error));
      return;
    }
    setError(null);
    const effortNum = effort ? Math.min(10, Math.max(1, Number(effort))) : undefined;
    startTransition(async () => {
      const res = await createRun({
        ranOn: date,
        distanceM,
        durationS,
        kind,
        effort: effortNum,
        note: note.trim() || undefined,
        source: "manual",
        shoeId: shoeId || undefined,
      });
      if (res.ok) {
        track(EVENTS.runLogged, { source: "manual" });
        if (res.xp) showXp(res.xp);
        const run: Run = {
          id: res.id ?? crypto.randomUUID(),
          ranOn: date,
          distanceM,
          durationS,
          paceSPerKm: livePace,
          kind,
          effort: effortNum,
          note: note.trim() || undefined,
          source: "manual",
        };
        setAdded((prev) => [run, ...prev]);
        setJournalDone(false);
        setNoXpNote(!runEarnsXp(distanceM, durationS, date, today));
        // Reset the entry fields for the next run (keep the date).
        setKm("");
        setH("");
        setM("");
        setS("");
        setEffort("");
        setNote("");
      } else {
        setError(failMessage(res.error));
      }
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="run-date" className="mb-1 block text-sm font-medium">
              {dict["course.new.date"]}
            </label>
            <input
              id="run-date"
              type="date"
              value={date}
              min={minDate}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="run-km" className="mb-1 block text-sm font-medium">
              {dict["course.new.distanceKm"]}
            </label>
            <input
              id="run-km"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-medium">{dict["course.tools.time"]}</legend>
            <div className="grid grid-cols-3 gap-2">
              <input aria-label={dict["course.new.hours"]} placeholder={dict["course.new.hours"]} type="number" min={0} value={h} onChange={(e) => setH(e.target.value)} className={inputClass} />
              <input aria-label={dict["course.new.minutes"]} placeholder={dict["course.new.minutes"]} type="number" min={0} value={m} onChange={(e) => setM(e.target.value)} className={inputClass} />
              <input aria-label={dict["course.new.seconds"]} placeholder={dict["course.new.seconds"]} type="number" min={0} value={s} onChange={(e) => setS(e.target.value)} className={inputClass} />
            </div>
          </fieldset>

          {livePace > 0 && (
            <p className="text-sm text-muted">
              {dict["course.computedPace"]}: <span className="font-semibold text-foreground">{formatPace(livePace)}</span> {dict["course.tools.perKm"]}
            </p>
          )}

          <div>
            <label htmlFor="run-kind" className="mb-1 block text-sm font-medium">
              {dict["course.new.kind"]}
            </label>
            <select id="run-kind" value={kind} onChange={(e) => setKind(e.target.value as RunKind)} className={inputClass}>
              {RUN_KINDS.map((k) => (
                <option key={k} value={k}>
                  {dict[`course.kind.${k}` as keyof Dictionary] as string}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="run-effort" className="mb-1 block text-sm font-medium">
              {dict["course.new.effort"]}
            </label>
            <input id="run-effort" type="number" min={1} max={10} value={effort} onChange={(e) => setEffort(e.target.value)} className={inputClass} />
          </div>

          {shoes.length > 0 && (
            <div>
              <label htmlFor="run-shoe" className="mb-1 block text-sm font-medium">
                {dict["course.shoes.select"]}
              </label>
              <select id="run-shoe" value={shoeId} onChange={(e) => setShoeId(e.target.value)} className={inputClass}>
                <option value="">{dict["course.shoes.selectNone"]}</option>
                {shoes.map((shoe) => (
                  <option key={shoe.id} value={shoe.id}>{shoe.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="run-note" className="mb-1 block text-sm font-medium">
              {dict["course.new.note"]}
            </label>
            <textarea id="run-note" rows={2} value={note} placeholder={dict["course.new.notePlaceholder"]} onChange={(e) => setNote(e.target.value)} className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20" />
          </div>

          {error && <p role="alert" className="text-sm text-ember">{error}</p>}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {dict["course.new.submit"]}
          </Button>
        </form>
      </Card>

      {added.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{dict["course.after.title"]}</CardTitle>
            <Check className="size-4 text-green-bright" />
          </CardHeader>
          <p role="status" className="text-sm text-green-bright">{dict["course.new.saved"]}</p>
          {noXpNote && <p className="mb-3 mt-1 text-sm text-muted">{dict["course.noXpNote"]}</p>}
          {!noXpNote && <div className="mb-3" />}
          <AfterRun run={added[0]} dict={dict} journalDone={journalDone} onJournalDone={() => setJournalDone(true)} />

          <ul className="mt-4 space-y-2" aria-label={dict["course.recentRuns"]}>
            {added.map((r) => (
              <li
                key={r.id}
                data-testid="added-run"
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <span className="font-medium">{formatKm(r.distanceM)} km</span>
                <span className="flex items-center gap-3 text-xs text-muted">
                  <span>{formatDuration(r.durationS)}</span>
                  <span className="flex items-center gap-1">
                    <Flame className="size-3.5 text-ember/70" />
                    {formatPace(r.paceSPerKm)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function AfterRun({
  run,
  dict,
  journalDone,
  onJournalDone,
}: {
  run: Run;
  dict: Dictionary;
  journalDone: boolean;
  onJournalDone: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function addJournal() {
    startTransition(async () => {
      const res = await createJournalEntry({
        title: dict["course.after.journalTitle"],
        body: dict["course.after.journalBody"],
      });
      if (res.ok) onJournalDone();
    });
  }

  async function share() {
    track(EVENTS.shared, { kind: "run" });
    const url = await signedRunImageUrl({
      distance: `${formatKm(run.distanceM)} km`,
      time: formatDuration(run.durationS),
      pace: `${formatPace(run.paceSPerKm)} /km`,
    });
    const absolute = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Kingdom Athlete", url: absolute });
        return;
      }
    } catch {
      // fall through to opening the image
    }
    if (typeof window !== "undefined") window.open(absolute, "_blank", "noopener");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={addJournal} disabled={pending || journalDone}>
        <NotebookPen className="size-4" />
        {journalDone ? dict["course.new.saved"] : dict["course.after.journal"]}
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={share}>
        <Share2 className="size-4" /> {dict["course.after.share"]}
      </Button>
    </div>
  );
}
