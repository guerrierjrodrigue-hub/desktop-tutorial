"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, RotateCcw, MonitorSmartphone, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cleanSegments, formatDuration } from "@/lib/running";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { RunSegment } from "@/types";

type Status = "idle" | "running" | "paused" | "finished";

interface Persisted {
  startedAt: number;
  pausedAccum: number;
  pausedAt: number | null;
  status: Status;
}

const IDLE: Persisted = { startedAt: 0, pausedAccum: 0, pausedAt: null, status: "idle" };

const kindColor: Record<RunSegment["kind"], string> = {
  warmup: "text-accent-bright",
  run: "text-green-bright",
  walk: "text-ember",
  cooldown: "text-accent",
};

export function IntervalTimer({
  sessionId,
  segments: raw,
  dict,
  locale,
}: {
  sessionId: string;
  segments: RunSegment[];
  dict: Dictionary;
  locale: LocaleCode;
}) {
  const segments = useMemo(() => cleanSegments(raw), [raw]);
  const total = useMemo(() => segments.reduce((s, x) => s + x.seconds, 0), [segments]);

  // Cumulative [start, end) boundaries (seconds) for each segment.
  const bounds = useMemo(() => {
    let acc = 0;
    const out: { seg: RunSegment; start: number; end: number }[] = [];
    for (const seg of segments) {
      out.push({ seg, start: acc, end: acc + seg.seconds });
      acc += seg.seconds;
    }
    return out;
  }, [segments]);

  const storageKey = `ka_run_timer_${sessionId}`;

  // Read any persisted session once, at mount, so a closed tab can resume. Pure:
  // for a running session we seed elapsed to the paused-math snapshot (0 if none)
  // and let the tick recompute the live elapsed from the clock on its first run.
  const initial = useMemo<{ state: Persisted; status: Status; elapsed: number }>(() => {
    try {
      if (typeof window === "undefined") return { state: IDLE, status: "idle", elapsed: 0 };
      const rawStr = localStorage.getItem(storageKey);
      if (!rawStr) return { state: IDLE, status: "idle", elapsed: 0 };
      const p = JSON.parse(rawStr) as Persisted;
      if (!p || !p.startedAt) return { state: IDLE, status: "idle", elapsed: 0 };
      if (p.status === "running") return { state: p, status: "running", elapsed: 0 };
      if (p.status === "paused" && p.pausedAt) {
        return { state: p, status: "paused", elapsed: Math.floor((p.pausedAt - p.startedAt - p.pausedAccum) / 1000) };
      }
      if (p.status === "finished") return { state: p, status: "finished", elapsed: total };
      return { state: IDLE, status: "idle", elapsed: 0 };
    } catch {
      return { state: IDLE, status: "idle", elapsed: 0 };
    }
  }, [storageKey, total]);

  const [status, setStatus] = useState<Status>(initial.status);
  const [elapsed, setElapsed] = useState(initial.elapsed);
  // Feature-detect screen wake support at init so no effect needs to set it.
  const [wakeUnsupported] = useState(
    () => typeof navigator !== "undefined" && !("wakeLock" in navigator),
  );

  const stateRef = useRef<Persisted>(initial.state);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const announcedRef = useRef<number>(-1);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateRef.current));
    } catch {
      // ignore (private mode / blocked storage)
    }
  }, [storageKey]);

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const requestWake = useCallback(async () => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> } };
      if (nav.wakeLock) {
        wakeRef.current = await nav.wakeLock.request("screen");
      }
    } catch {
      // ignore: unsupported is already surfaced via the wakeUnsupported flag
    }
  }, []);

  const releaseWake = useCallback(() => {
    try {
      wakeRef.current?.release?.();
    } catch {
      // ignore
    }
    wakeRef.current = null;
  }, []);

  const beep = useCallback((freq: number, ms: number) => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = (audioRef.current ??= new Ctx());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      osc.start(t);
      osc.stop(t + ms / 1000);
    } catch {
      // ignore
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      try {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = locale === "fr" ? "fr-FR" : "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        // ignore
      }
    },
    [locale],
  );

  const announceSegment = useCallback(
    (kind: RunSegment["kind"]) => {
      beep(kind === "run" ? 880 : 440, 220);
      try {
        navigator.vibrate?.(200);
      } catch {
        // ignore
      }
      speak(dict[`course.segment.${kind}` as keyof Dictionary] as string);
    },
    [beep, speak, dict],
  );

  const currentIndex = useMemo(() => {
    if (status === "finished") return bounds.length - 1;
    const i = bounds.findIndex((b) => elapsed >= b.start && elapsed < b.end);
    return i === -1 ? Math.max(0, bounds.length - 1) : i;
  }, [elapsed, bounds, status]);

  const current = bounds[currentIndex];
  const remaining = current ? Math.max(0, current.end - elapsed) : 0;
  const next = bounds[currentIndex + 1];

  // The tick loop (setState happens inside the timer callback, not synchronously).
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const s = stateRef.current;
      const e = Math.floor((Date.now() - s.startedAt - s.pausedAccum) / 1000);
      if (e >= total) {
        setElapsed(total);
        setStatus("finished");
        stateRef.current = { ...s, status: "finished" };
        persist();
        releaseWake();
        beep(660, 200);
        setTimeout(() => beep(880, 300), 240);
        speak(dict["course.timer.finished"]);
        return;
      }
      setElapsed(e);
    }, 250);
    return () => clearInterval(id);
  }, [status, total, persist, releaseWake, beep, speak, dict]);

  // Announce a new segment whenever the current index advances while running.
  useEffect(() => {
    if (status !== "running") return;
    if (announcedRef.current !== currentIndex && current) {
      announcedRef.current = currentIndex;
      announceSegment(current.seg.kind);
    }
  }, [currentIndex, current, status, announceSegment]);

  // Acquire the wake lock when running (including a resumed session on mount),
  // re-acquire it on returning to the tab, and release it on unmount.
  useEffect(() => {
    if (status === "running") void requestWake();
    function onVisible() {
      if (document.visibilityState === "visible" && stateRef.current.status === "running") {
        void requestWake();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, requestWake]);

  useEffect(() => () => releaseWake(), [releaseWake]);

  function start() {
    const now = Date.now();
    stateRef.current = { startedAt: now, pausedAccum: 0, pausedAt: null, status: "running" };
    setElapsed(0);
    setStatus("running");
    persist();
    void requestWake();
    // Prime audio within the user gesture and announce the first segment.
    if (bounds[0]) announceSegment(bounds[0].seg.kind);
    announcedRef.current = 0;
  }

  function pause() {
    const s = stateRef.current;
    stateRef.current = { ...s, pausedAt: Date.now(), status: "paused" };
    setStatus("paused");
    persist();
    releaseWake();
  }

  function resume() {
    const s = stateRef.current;
    const pausedFor = s.pausedAt ? Date.now() - s.pausedAt : 0;
    stateRef.current = { ...s, pausedAccum: s.pausedAccum + pausedFor, pausedAt: null, status: "running" };
    setStatus("running");
    persist();
    void requestWake();
  }

  function reset() {
    stateRef.current = { ...IDLE };
    announcedRef.current = -1;
    setElapsed(0);
    setStatus("idle");
    clearPersisted();
    releaseWake();
  }

  const segLabel = (kind: RunSegment["kind"]) => dict[`course.segment.${kind}` as keyof Dictionary] as string;

  return (
    <Card className="text-center">
      <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <MonitorSmartphone className="size-3.5 text-accent/80" /> {dict["course.timer.screenOn"]}
      </p>
      {wakeUnsupported && (
        <p role="status" className="mb-3 text-xs text-ember">{dict["course.timer.wakeUnsupported"]}</p>
      )}

      {status === "finished" ? (
        <div className="py-6">
          <Check className="mx-auto size-10 text-green-bright" />
          <p className="mt-3 font-serif text-xl font-semibold">{dict["course.timer.finished"]}</p>
          <Link href="/course/nouvelle" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
            {dict["course.logRun"]}
          </Link>
          <div className="mt-3">
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" /> {dict["course.timer.reset"]}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className={cn("text-sm font-semibold uppercase tracking-wide", current ? kindColor[current.seg.kind] : "text-muted")}>
            {current ? segLabel(current.seg.kind) : segLabel("warmup")}
          </p>
          <p className="my-2 font-serif text-6xl font-semibold tabular-nums" aria-live="polite">
            {formatDuration(remaining)}
          </p>
          <p className="text-xs text-faint">
            {dict["course.timer.segmentOf"]
              .replace("{n}", String(currentIndex + 1))
              .replace("{total}", String(bounds.length))}
            {" · "}
            {formatDuration(total - elapsed)}
          </p>
          {next && (
            <p className="mt-1 text-sm text-muted">
              {dict["course.timer.next"]}: {segLabel(next.seg.kind)} ({formatDuration(next.seg.seconds)})
            </p>
          )}

          <div className="mt-5 flex items-center justify-center gap-2">
            {status === "idle" && (
              <Button type="button" onClick={start}>
                <Play className="size-4" /> {dict["course.timer.start"]}
              </Button>
            )}
            {status === "running" && (
              <Button type="button" variant="secondary" onClick={pause}>
                <Pause className="size-4" /> {dict["course.timer.pause"]}
              </Button>
            )}
            {status === "paused" && (
              <Button type="button" onClick={resume}>
                <Play className="size-4" /> {dict["course.timer.resume"]}
              </Button>
            )}
            {status !== "idle" && (
              <Button type="button" variant="ghost" onClick={reset}>
                <RotateCcw className="size-4" /> {dict["course.timer.reset"]}
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
