"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, RotateCcw, X } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import type { Dictionary } from "@/i18n/dictionaries/en";

type Scene =
  | { kind: "statement"; eyebrow?: string; title: string; caption?: string; duration: number }
  | {
      kind: "feature";
      eyebrow: string;
      title: string;
      caption: string;
      duration: number;
      render: () => React.ReactNode;
    }
  | { kind: "logo"; duration: number };

function buildScenes(dict: Dictionary): Scene[] {
  const chapter = (n: number) => dict["mkt.film.chapter"].replace("{n}", String(n));
  return [
    {
      kind: "statement",
      eyebrow: APP_NAME,
      title: dict["mkt.film.intro.title"],
      caption: dict["mkt.film.intro.caption"],
      duration: 3800,
    },
    {
      kind: "statement",
      title: dict["mkt.verse.short"],
      caption: dict["mkt.verse.shortRef"],
      duration: 4200,
    },
    {
      kind: "statement",
      title: dict["mkt.film.purpose.title"],
      caption: dict["mkt.film.purpose.caption"],
      duration: 3800,
    },
    {
      kind: "feature",
      eyebrow: chapter(1),
      title: dict["mkt.film.train.title"],
      caption: dict["mkt.film.train.caption"],
      duration: 4500,
      render: () => (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict["mkt.todaysWorkout"]}
          </p>
          <p className="mt-2 font-serif text-2xl">{dict["mkt.workout.name"]}</p>
          <p className="mt-1 text-sm text-muted">{dict["mkt.workout.meta"]}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-accent to-accent-bright" />
          </div>
        </div>
      ),
    },
    {
      kind: "feature",
      eyebrow: chapter(2),
      title: dict["mkt.film.alone.title"],
      caption: dict["mkt.film.alone.caption"],
      duration: 4500,
      render: () => (
        <div className="space-y-2 rounded-2xl border border-border bg-surface-2 p-6">
          <div className="ml-auto max-w-[80%] rounded-2xl bg-surface px-3 py-2 text-right text-sm">
            {dict["mkt.film.alone.user"]}
          </div>
          <div className="max-w-[80%] rounded-2xl bg-gradient-to-br from-green-deep to-green/30 px-3 py-2 text-sm">
            {dict["mkt.film.alone.coach"]}
          </div>
        </div>
      ),
    },
    {
      kind: "feature",
      eyebrow: chapter(3),
      title: dict["mkt.hero.title2"],
      caption: dict["mkt.film.faith.caption"],
      duration: 4500,
      render: () => (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict["mkt.verseOfDay"]}
          </p>
          <p className="mt-2 font-serif text-lg leading-snug">{dict["mkt.verse.short"]}</p>
          <p className="mt-2 text-sm text-accent-bright">{dict["mkt.verse.shortRef"]}</p>
        </div>
      ),
    },
    {
      kind: "feature",
      eyebrow: chapter(4),
      title: dict["mkt.film.habits.title"],
      caption: dict["mkt.film.habits.caption"],
      duration: 4500,
      render: () => (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-accent-bright">
              <Flame className="size-4" /> {dict["mkt.film.habits.streak"]}
            </span>
            <span className="text-muted">{dict["mkt.film.habits.level"]}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-accent to-accent-bright" />
          </div>
        </div>
      ),
    },
    {
      kind: "feature",
      eyebrow: chapter(5),
      title: dict["mkt.film.people.title"],
      caption: dict["mkt.film.people.caption"],
      duration: 4500,
      render: () => (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict["mkt.film.people.challenge"]}
          </p>
          <p className="mt-2 font-serif text-lg">{dict["mkt.film.people.count"]}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
            <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-green-deep to-green-bright" />
          </div>
        </div>
      ),
    },
    {
      kind: "statement",
      title: dict["mkt.film.outro.title"],
      caption: dict["mkt.film.outro.caption"],
      duration: 4000,
    },
    { kind: "logo", duration: 0 },
  ];
}

export function FilmModal({
  dict,
  open,
  onClose,
}: {
  dict: Dictionary;
  open: boolean;
  onClose: () => void;
}) {
  const SCENES = useMemo(() => buildScenes(dict), [dict]);
  const LAST_INDEX = SCENES.length - 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setIndex(0), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const scene = SCENES[index];
    if (index >= LAST_INDEX || scene.duration <= 0) return;
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, LAST_INDEX)), scene.duration);
    return () => clearTimeout(t);
  }, [open, index, SCENES, LAST_INDEX]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const scene = SCENES[index];
  const goTo = (i: number) => setIndex(Math.max(0, Math.min(i, LAST_INDEX)));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden bg-black"
      >
        {/* Ambient cinematic backdrop */}
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.08 }}
          transition={{ duration: Math.max(scene.duration, 3000) / 1000, ease: "linear" }}
          className="absolute inset-0 -z-10 bg-gradient-to-br from-green-deep/40 via-black to-black"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_75%)]" />

        <button
          onClick={onClose}
          aria-label={dict["mkt.film.close"]}
          className="absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>

        {/* Story progress bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex gap-1.5 p-4">
          {SCENES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={dict["mkt.film.goToScene"].replace("{n}", String(i + 1))}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"
            >
              <motion.span
                className="block h-full rounded-full bg-accent-bright"
                initial={{ width: "0%" }}
                animate={{ width: i < index ? "100%" : i > index ? "0%" : "100%" }}
                transition={
                  i === index && s.duration > 0
                    ? { duration: s.duration / 1000, ease: "linear" }
                    : { duration: 0 }
                }
              />
            </button>
          ))}
        </div>

        <div
          className="relative flex h-full w-full items-center justify-center px-6"
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            if (index < LAST_INDEX) goTo(index + 1);
            else onClose();
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mx-auto w-full max-w-lg text-center"
            >
              {scene.kind === "logo" ? <LogoScene dict={dict} onClose={onClose} onReplay={() => goTo(0)} /> : null}

              {scene.kind === "statement" && (
                <>
                  {scene.eyebrow && (
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright/80">
                      {scene.eyebrow}
                    </p>
                  )}
                  <h2 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    {scene.title}
                  </h2>
                  {scene.caption && (
                    <p className="mt-4 text-base text-white/60">{scene.caption}</p>
                  )}
                </>
              )}

              {scene.kind === "feature" && (
                <>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright/80">
                    {scene.eyebrow}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {scene.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">{scene.caption}</p>
                  <div className="glass ring-accent mt-6 overflow-hidden rounded-3xl border border-white/10 p-2">
                    {scene.render()}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Playback controls */}
        {scene.kind !== "logo" && (
          <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-4">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label={dict["mkt.film.previous"]}
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label={dict["mkt.film.next"]}
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function LogoScene({
  dict,
  onClose,
  onReplay,
}: {
  dict: Dictionary;
  onClose: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-bright to-accent-deep text-accent-fg shadow-[0_10px_40px_-8px_rgba(0,0,0,0.5)]"
      >
        <svg viewBox="0 0 24 24" className="size-8" fill="currentColor" aria-hidden="true">
          <path d="M3 8l3.8 2.8L12 5l5.2 5.8L21 8l-1.4 7.5H4.4L3 8Z" />
          <rect x="4.2" y="16.4" width="15.6" height="2.4" rx="0.7" />
        </svg>
      </motion.span>
      <h2 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Kingdom<span className="text-accent-bright"> Athlete</span>
      </h2>
      <p className="mt-3 text-base text-white/60">{dict["mkt.tagline"]}</p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent-bright to-accent-deep px-6 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
        >
          {dict["mkt.hero.cta"]}
        </Link>
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-3.5" />
          {dict["mkt.film.watchAgain"]}
        </button>
      </div>
      <span className="sr-only">{APP_NAME}</span>
    </div>
  );
}
