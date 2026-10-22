"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { durationToSeconds, paceSecPerKm, formatPace, formatDuration, riegelPredict } from "@/lib/running";
import type { Dictionary } from "@/i18n/dictionaries/en";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

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

export function RunningTools({ dict }: { dict: Dictionary }) {
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
    </div>
  );
}
