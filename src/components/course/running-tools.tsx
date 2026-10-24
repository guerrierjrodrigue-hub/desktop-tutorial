"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntervalTimer } from "@/components/course/interval-timer";
import {
  durationToSeconds,
  paceSecPerKm,
  formatPace,
  formatDuration,
  riegelPredict,
  trainingPaces,
  daysUntil,
  buildIntervalSegments,
  type PaceZone,
  type IntervalMode,
} from "@/lib/running";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { RunSegment } from "@/types";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

const ZONES: PaceZone[] = ["easy", "long", "tempo", "interval", "repetition"];

function TimeFields({
  dict,
  h, m, s, setH, setM, setS,
}: {
  dict: Dictionary;
  h: string; m: string; s: string;
  setH: (v: string) => void; setM: (v: string) => void; setS: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <input aria-label={dict["course.new.hours"]} placeholder={dict["course.new.hours"]} type="number" min={0} value={h} onChange={(e) => setH(e.target.value)} className={inputClass} />
      <input aria-label={dict["course.new.minutes"]} placeholder={dict["course.new.minutes"]} type="number" min={0} value={m} onChange={(e) => setM(e.target.value)} className={inputClass} />
      <input aria-label={dict["course.new.seconds"]} placeholder={dict["course.new.seconds"]} type="number" min={0} value={s} onChange={(e) => setS(e.target.value)} className={inputClass} />
    </div>
  );
}

export function RunningTools({ dict, locale }: { dict: Dictionary; locale: LocaleCode }) {
  // Pace calculator.
  const [pKm, setPKm] = useState("");
  const [pH, setPH] = useState("");
  const [pM, setPM] = useState("");
  const [pS, setPS] = useState("");
  const paceDistance = Math.round((Number(pKm) || 0) * 1000);
  const paceDuration = durationToSeconds(Number(pH), Number(pM), Number(pS));
  const pace = paceSecPerKm(paceDistance, paceDuration);

  // Riegel prediction.
  const [kKm, setKKm] = useState("");
  const [kH, setKH] = useState("");
  const [kM, setKM] = useState("");
  const [kS, setKS] = useState("");
  const [tKm, setTKm] = useState("");
  const knownDistance = Math.round((Number(kKm) || 0) * 1000);
  const knownTime = durationToSeconds(Number(kH), Number(kM), Number(kS));
  const targetDistance = Math.round((Number(tKm) || 0) * 1000);
  const predicted = riegelPredict(knownDistance, knownTime, targetDistance);
  const predictedPace = predicted > 0 && targetDistance > 0 ? paceSecPerKm(targetDistance, predicted) : 0;

  // Training paces from a recent race.
  const [zKm, setZKm] = useState("");
  const [zH, setZH] = useState("");
  const [zM, setZM] = useState("");
  const [zS, setZS] = useState("");
  const paces = trainingPaces(Math.round((Number(zKm) || 0) * 1000), durationToSeconds(Number(zH), Number(zM), Number(zS)));

  // Race countdown with a target time.
  const [raceDate, setRaceDate] = useState("");
  const [cKm, setCKm] = useState("");
  const [cH, setCH] = useState("");
  const [cM, setCM] = useState("");
  const [cS, setCS] = useState("");
  const todayISO = new Date().toISOString().slice(0, 10);
  const countdown = raceDate ? daysUntil(todayISO, raceDate) : null;
  const countDistance = Math.round((Number(cKm) || 0) * 1000);
  const countTime = durationToSeconds(Number(cH), Number(cM), Number(cS));
  const requiredPace = countDistance > 0 && countTime > 0 ? paceSecPerKm(countDistance, countTime) : 0;

  // Interval builder.
  const [reps, setReps] = useState("");
  const [mode, setMode] = useState<IntervalMode>("duration");
  const [repSec, setRepSec] = useState("");
  const [repM, setRepM] = useState("");
  const [repPace, setRepPace] = useState("");
  const [recovery, setRecovery] = useState("");
  const [warmup, setWarmup] = useState("");
  const [cooldown, setCooldown] = useState("");
  const [built, setBuilt] = useState<RunSegment[]>([]);
  const [buildNonce, setBuildNonce] = useState(0);
  const [builderError, setBuilderError] = useState(false);

  function build() {
    const segs = buildIntervalSegments({
      reps: Number(reps),
      mode,
      runSeconds: mode === "duration" ? Number(repSec) : undefined,
      runDistanceM: mode === "distance" ? Number(repM) : undefined,
      paceSPerKm: mode === "distance" ? Number(repPace) : undefined,
      recoverySeconds: Number(recovery) || 0,
      warmupSeconds: Number(warmup) || 0,
      cooldownSeconds: Number(cooldown) || 0,
    });
    if (segs.length === 0) {
      setBuilderError(true);
      setBuilt([]);
      return;
    }
    setBuilderError(false);
    setBuilt(segs);
    setBuildNonce((n) => n + 1);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{dict["course.tools.paceCalc"]}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="pace-km" className="mb-1 block text-sm font-medium">{dict["course.tools.distanceKm"]}</label>
            <input id="pace-km" type="number" inputMode="decimal" min={0} step="0.01" value={pKm} onChange={(e) => setPKm(e.target.value)} className={inputClass} />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">{dict["course.tools.time"]}</span>
            <TimeFields dict={dict} h={pH} m={pM} s={pS} setH={setPH} setM={setPM} setS={setPS} />
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">{dict["course.tools.yourPace"]}</p>
            <p className="mt-1 font-serif text-3xl font-semibold tabular-nums" data-testid="pace-result">
              {pace > 0 ? `${formatPace(pace)}` : "0:00"}
              <span className="ml-1 text-base text-muted">{dict["course.tools.perKm"]}</span>
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict["course.tools.predict"]}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="known-km" className="mb-1 block text-sm font-medium">{dict["course.tools.knownDistance"]}</label>
            <input id="known-km" type="number" inputMode="decimal" min={0} step="0.01" value={kKm} onChange={(e) => setKKm(e.target.value)} className={inputClass} />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">{dict["course.tools.knownTime"]}</span>
            <TimeFields dict={dict} h={kH} m={kM} s={kS} setH={setKH} setM={setKM} setS={setKS} />
          </div>
          <div>
            <label htmlFor="target-km" className="mb-1 block text-sm font-medium">{dict["course.tools.targetDistance"]}</label>
            <input id="target-km" type="number" inputMode="decimal" min={0} step="0.01" value={tKm} onChange={(e) => setTKm(e.target.value)} className={inputClass} />
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">{dict["course.tools.predicted"]}</p>
            <p className="mt-1 font-serif text-3xl font-semibold tabular-nums" data-testid="predict-result">
              {predicted > 0 ? formatDuration(predicted) : "0:00"}
            </p>
            {predictedPace > 0 && (
              <p className="mt-1 text-sm text-muted">{formatPace(predictedPace)} {dict["course.tools.perKm"]}</p>
            )}
          </div>
          <p className="text-xs text-faint">{dict["course.tools.riegelNote"]}</p>
        </div>
      </Card>

      {/* Training paces (estimation). */}
      <Card>
        <CardHeader>
          <CardTitle>{dict["course.tools.paces"]}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="paces-km" className="mb-1 block text-sm font-medium">{dict["course.tools.raceDistance"]}</label>
            <input id="paces-km" type="number" inputMode="decimal" min={0} step="0.01" value={zKm} onChange={(e) => setZKm(e.target.value)} className={inputClass} />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">{dict["course.tools.raceTime"]}</span>
            <TimeFields dict={dict} h={zH} m={zM} s={zS} setH={setZH} setM={setZM} setS={setZS} />
          </div>
          {paces && (
            <ul className="divide-y divide-border rounded-xl border border-border bg-surface-2" data-testid="paces-result">
              {ZONES.map((zone) => (
                <li key={zone} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted">{dict[`course.tools.zone.${zone}` as keyof Dictionary] as string}</span>
                  <span className="font-semibold tabular-nums">
                    {formatPace(paces.zones[zone].fastSPerKm)} - {formatPace(paces.zones[zone].slowSPerKm)}
                    <span className="ml-1 text-xs font-normal text-muted">{dict["course.tools.perKm"]}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-faint">
            <span className="uppercase tracking-wide">{dict["course.tools.estimation"]}</span>
            {": "}
            {dict["course.tools.pacesNote"]}
          </p>
        </div>
      </Card>

      {/* Race countdown. */}
      <Card>
        <CardHeader>
          <CardTitle>{dict["course.tools.countdown"]}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="race-date" className="mb-1 block text-sm font-medium">{dict["course.tools.raceDate"]}</label>
            <input id="race-date" type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} className={inputClass} />
          </div>
          {countdown !== null && (
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-center">
              {countdown > 0 ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-faint">{dict["course.tools.daysLeft"]}</p>
                  <p className="mt-1 font-serif text-3xl font-semibold tabular-nums" data-testid="countdown-result">{countdown}</p>
                </>
              ) : countdown === 0 ? (
                <p className="text-sm text-green-bright" data-testid="countdown-result">{dict["course.tools.raceToday"]}</p>
              ) : (
                <p className="text-sm text-muted" data-testid="countdown-result">{dict["course.tools.racePast"]}</p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="count-km" className="mb-1 block text-sm font-medium">{dict["course.tools.goalDistanceKm"]}</label>
            <input id="count-km" type="number" inputMode="decimal" min={0} step="0.01" value={cKm} onChange={(e) => setCKm(e.target.value)} className={inputClass} />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">{dict["course.tools.targetTime"]}</span>
            <TimeFields dict={dict} h={cH} m={cM} s={cS} setH={setCH} setM={setCM} setS={setCS} />
          </div>
          {requiredPace > 0 && (
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">{dict["course.tools.requiredPace"]}</p>
              <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">
                {formatPace(requiredPace)}<span className="ml-1 text-sm text-muted">{dict["course.tools.perKm"]}</span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Interval builder -> existing timer. */}
      <Card>
        <CardHeader>
          <CardTitle>{dict["course.tools.builder"]}</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="iv-reps" className="mb-1 block text-sm font-medium">{dict["course.tools.reps"]}</label>
              <input id="iv-reps" type="number" min={1} max={30} value={reps} onChange={(e) => setReps(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="iv-mode" className="mb-1 block text-sm font-medium">{dict["course.tools.mode"]}</label>
              <select id="iv-mode" value={mode} onChange={(e) => setMode(e.target.value as IntervalMode)} className={inputClass}>
                <option value="duration">{dict["course.tools.modeDuration"]}</option>
                <option value="distance">{dict["course.tools.modeDistance"]}</option>
              </select>
            </div>
          </div>
          {mode === "duration" ? (
            <div>
              <label htmlFor="iv-sec" className="mb-1 block text-sm font-medium">{dict["course.tools.repSeconds"]}</label>
              <input id="iv-sec" type="number" min={1} value={repSec} onChange={(e) => setRepSec(e.target.value)} className={inputClass} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="iv-m" className="mb-1 block text-sm font-medium">{dict["course.tools.repMeters"]}</label>
                <input id="iv-m" type="number" min={1} value={repM} onChange={(e) => setRepM(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="iv-pace" className="mb-1 block text-sm font-medium">{dict["course.tools.repPace"]}</label>
                <input id="iv-pace" type="number" min={1} value={repPace} onChange={(e) => setRepPace(e.target.value)} className={inputClass} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="iv-rec" className="mb-1 block text-sm font-medium">{dict["course.tools.recovery"]}</label>
              <input id="iv-rec" type="number" min={0} value={recovery} onChange={(e) => setRecovery(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="iv-wu" className="mb-1 block text-sm font-medium">{dict["course.tools.warmupS"]}</label>
              <input id="iv-wu" type="number" min={0} value={warmup} onChange={(e) => setWarmup(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="iv-cd" className="mb-1 block text-sm font-medium">{dict["course.tools.cooldownS"]}</label>
              <input id="iv-cd" type="number" min={0} value={cooldown} onChange={(e) => setCooldown(e.target.value)} className={inputClass} />
            </div>
          </div>
          <Button type="button" onClick={build}>{dict["course.tools.build"]}</Button>
          {builderError && <p role="alert" className="text-sm text-ember">{dict["course.tools.builderEmpty"]}</p>}
        </div>
      </Card>

      {built.length > 0 && (
        <IntervalTimer key={buildNonce} sessionId="builder" segments={built} dict={dict} locale={locale} />
      )}
    </div>
  );
}
