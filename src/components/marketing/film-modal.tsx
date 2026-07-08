"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Scene {
  title: string;
  caption: string;
  render: () => React.ReactNode;
}

const SCENES: Scene[] = [
  {
    title: "Train with purpose",
    caption: "Guided programs that adapt to your level, your goals, your day.",
    render: () => (
      <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Today&apos;s workout
        </p>
        <p className="mt-2 font-serif text-2xl">Lower Body Power</p>
        <p className="mt-1 text-sm text-muted">4 exercises · 45 min</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-gold to-gold-bright" />
        </div>
      </div>
    ),
  },
  {
    title: "Talk to your coach",
    caption: "Barnabas and three other AI coaches — always ready, never judging.",
    render: () => (
      <div className="space-y-2 rounded-2xl border border-border bg-surface-2 p-6">
        <div className="ml-auto max-w-[80%] rounded-2xl bg-surface px-3 py-2 text-right text-sm">
          Feeling unmotivated today.
        </div>
        <div className="max-w-[80%] rounded-2xl bg-gradient-to-br from-green-deep to-green/30 px-3 py-2 text-sm">
          That&apos;s already discipline — showing up honest. Let&apos;s make today small
          and winnable. 🙌
        </div>
      </div>
    ),
  },
  {
    title: "Grow your faith",
    caption: "Scripture, prayer, and devotionals woven into every day.",
    render: () => (
      <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Verse of the day
        </p>
        <p className="mt-2 font-serif text-lg leading-snug">
          “Do you not know that your bodies are temples of the Holy Spirit?”
        </p>
        <p className="mt-2 text-sm text-gold-bright">1 Corinthians 6:19</p>
      </div>
    ),
  },
  {
    title: "Build unbreakable habits",
    caption: "Daily quests, streaks, and a transformation score that keeps you honest.",
    render: () => (
      <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-gold-bright">
            <Flame className="size-4" /> 26-day streak
          </span>
          <span className="text-muted">Level 13</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-gold to-gold-bright" />
        </div>
      </div>
    ),
  },
  {
    title: "Never train alone",
    caption: "Join a church, a small group, or a friend circle — iron sharpens iron.",
    render: () => (
      <div className="rounded-2xl border border-border bg-surface-2 p-6 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          40 Days of Discipline
        </p>
        <p className="mt-2 font-serif text-lg">1,284 believers training together</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-green-deep to-green-bright" />
        </div>
      </div>
    ),
  },
];

export function FilmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);

  // Start from the first scene each time the modal opens.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setIndex(0), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Auto-advance through the scenes while open.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), 4000);
    return () => clearTimeout(t);
  }, [open, index]);

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="glass ring-gold relative w-full max-w-lg overflow-hidden rounded-3xl border border-border p-6 sm:p-8"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-serif text-2xl font-semibold">{scene.title}</h2>
              <p className="mt-2 text-sm text-muted">{scene.caption}</p>
              <div className="mt-5">{scene.render()}</div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setIndex((i) => (i - 1 + SCENES.length) % SCENES.length)}
              aria-label="Previous scene"
              className="grid size-9 place-items-center rounded-full border border-border text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex gap-1.5">
              {SCENES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to scene ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-gold-bright" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => setIndex((i) => (i + 1) % SCENES.length)}
              aria-label="Next scene"
              className="grid size-9 place-items-center rounded-full border border-border text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
